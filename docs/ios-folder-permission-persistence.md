# Fixing iOS Folder Permission Persistence in Expo/React Native

## The Problem

When using `expo-file-system` or document pickers to access user-selected folders on iOS, the app loses access to those folders after restart. Users see errors like:

```
Permission denied for course "folder name" - folder may need to be re-added
```

This happens because iOS uses **Security-Scoped Resources** - temporary access grants that expire when the app closes.

## Why This Happens

iOS sandboxing restricts apps from accessing files outside their container. When a user picks a folder:

1. iOS grants **temporary** security-scoped access
2. The app can read/write to that folder during the session
3. **On app restart, access is revoked**

The solution is iOS **Security-Scoped Bookmarks** - persistent tokens that can restore access.

## The Solution

### Overview

1. When picking a folder, request a **bookmark** (persistent access token)
2. Store the bookmark string alongside the folder path
3. Before accessing the folder after restart, **resolve the bookmark** to restore access

### Step 1: Get Bookmarks When Picking Folders

Use `@react-native-documents/picker` with `requestLongTermAccess: true`:

```typescript
import { pickDirectory } from '@react-native-documents/picker';

const result = await pickDirectory({
  requestLongTermAccess: true, // Returns iOS bookmark
});

// result.bookmarkStatus === 'success'
// result.bookmark contains the base64-encoded bookmark string
```

Store the bookmark with your folder reference:

```typescript
interface StoredCourse {
  id: string;
  name: string;
  folderPath: string;
  iosBookmark?: string; // Store the bookmark!
}
```

### Step 2: Create Native Module to Resolve Bookmarks

`expo-file-system` doesn't know about bookmarks. You need a native Expo Module to call iOS APIs.

#### Module Structure

```
modules/bookmark-resolver/
├── expo-module.config.json
├── package.json
├── index.ts
└── ios/
    ├── BookmarkResolver.podspec
    └── BookmarkResolverModule.swift
```

#### expo-module.config.json

```json
{
  "platforms": ["apple"],
  "apple": {
    "modules": ["BookmarkResolverModule"]
  }
}
```

**Important:** Use `"apple"` not `"ios"` - Expo's autolinking expects this.

#### package.json

```json
{
  "name": "bookmark-resolver",
  "version": "1.0.0",
  "main": "index.ts",
  "types": "index.ts",
  "peerDependencies": {
    "expo": "*",
    "react": "*",
    "react-native": "*"
  }
}
```

#### ios/BookmarkResolver.podspec

**Must be in the `ios/` subdirectory**, not at module root!

```ruby
require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'BookmarkResolver'
  s.version        = package['version']
  s.summary        = 'iOS bookmark resolver for security-scoped resources'
  s.description    = 'Resolves iOS security-scoped bookmarks to restore access to directories'
  s.author         = ''
  s.license        = 'MIT'
  s.homepage       = 'https://github.com/example'
  s.platforms      = { :ios => '13.4' }
  s.swift_version  = '5.4'
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.source_files = '**/*.{h,m,mm,swift}'
end
```

#### ios/BookmarkResolverModule.swift

```swift
import ExpoModulesCore

public class BookmarkResolverModule: Module {
  private var accessedURLs: [String: URL] = [:]

  public func definition() -> ModuleDefinition {
    Name("BookmarkResolver")

    AsyncFunction("resolveBookmark") { (bookmarkBase64: String) -> Bool in
      guard let bookmarkData = Data(base64Encoded: bookmarkBase64) else {
        throw NSError(
          domain: "BookmarkResolver",
          code: 1,
          userInfo: [NSLocalizedDescriptionKey: "Invalid bookmark data"]
        )
      }

      var isStale = false
      let url = try URL(
        resolvingBookmarkData: bookmarkData,
        options: .withoutUI,
        relativeTo: nil,
        bookmarkDataIsStale: &isStale
      )

      if isStale {
        print("[BookmarkResolver] Warning: Bookmark is stale for URL: \(url.path)")
      }

      let success = url.startAccessingSecurityScopedResource()
      if success {
        self.accessedURLs[url.absoluteString] = url
        print("[BookmarkResolver] Successfully started accessing: \(url.path)")
      }

      return success
    }

    AsyncFunction("stopAccessing") { (uri: String) -> Void in
      if let url = self.accessedURLs[uri] {
        url.stopAccessingSecurityScopedResource()
        self.accessedURLs.removeValue(forKey: uri)
      }
    }
  }
}
```

#### index.ts

```typescript
import { Platform } from 'react-native';

let BookmarkResolver: {
  resolveBookmark: (bookmark: string) => Promise<boolean>;
  stopAccessing: (uri: string) => Promise<void>;
} | null = null;

if (Platform.OS === 'ios') {
  try {
    const { requireNativeModule } = require('expo-modules-core');
    BookmarkResolver = requireNativeModule('BookmarkResolver');
  } catch (error) {
    console.warn('[BookmarkResolver] Failed to load native module:', error);
  }
}

export async function resolveBookmark(bookmark: string): Promise<boolean> {
  if (Platform.OS !== 'ios' || !BookmarkResolver) return true;

  try {
    return await BookmarkResolver.resolveBookmark(bookmark);
  } catch (error) {
    console.error('[BookmarkResolver] Error resolving bookmark:', error);
    return false;
  }
}

export async function stopAccessing(uri: string): Promise<void> {
  if (Platform.OS !== 'ios' || !BookmarkResolver) return;
  await BookmarkResolver.stopAccessing(uri);
}
```

### Step 3: Link the Module

Add to your project's `package.json`:

```json
{
  "dependencies": {
    "bookmark-resolver": "file:./modules/bookmark-resolver"
  }
}
```

Run `npm install` to create the symlink.

### Step 4: Resolve Bookmarks Before Accessing Folders

```typescript
import { resolveBookmark } from 'bookmark-resolver';
import { Directory } from 'expo-file-system/next';

async function scanCourse(storedCourse: StoredCourse) {
  // Resolve bookmark first on iOS
  if (Platform.OS === 'ios' && storedCourse.iosBookmark) {
    const success = await resolveBookmark(storedCourse.iosBookmark);
    if (!success) {
      console.warn('Failed to resolve bookmark - folder needs to be re-added');
      return null;
    }
  }

  // Now you can access the directory
  const dir = new Directory(storedCourse.folderPath);
  const contents = dir.list(); // This works now!
}
```

### Step 5: Rebuild

```bash
rm -rf ios/Pods ios/Podfile.lock
npx expo prebuild --clean
npx expo run:ios --device
```

## Common Pitfalls

### 1. Wrong Platform Key in expo-module.config.json

```json
// WRONG
{ "platforms": ["ios"], "ios": { ... } }

// CORRECT
{ "platforms": ["apple"], "apple": { ... } }
```

### 2. Podspec in Wrong Location

```
// WRONG - autolinking won't find it
modules/bookmark-resolver/BookmarkResolver.podspec

// CORRECT
modules/bookmark-resolver/ios/BookmarkResolver.podspec
```

### 3. Module Not in package.json Dependencies

The module must be a dependency so npm creates a symlink in `node_modules`:

```json
"dependencies": {
  "bookmark-resolver": "file:./modules/bookmark-resolver"
}
```

### 4. Swift Syntax Error

The URL initializer throws, so use `try`, not `guard let`:

```swift
// WRONG
guard let url = URL(resolvingBookmarkData: ...) else { ... }

// CORRECT
let url = try URL(resolvingBookmarkData: ...)
```

## Verification

After rebuilding, check the logs:

**Success:**
```
[BookmarkResolver] Successfully started accessing: /path/to/folder
```

**Failure (module not loaded):**
```
WARN [BookmarkResolver] Failed to load native module
```

If you see the failure message, check:
1. Is the module in `npx expo-modules-autolinking resolve` output?
2. Is `BookmarkResolverModule.self` in `ios/Pods/Target Support Files/Pods-*/ExpoModulesProvider.swift`?

## How It Works

1. **pickDirectory** with `requestLongTermAccess: true` creates a security-scoped bookmark
2. The bookmark is a base64-encoded blob containing encrypted access credentials
3. On app restart, iOS revokes the temporary access
4. **resolveBookmark** calls:
   - `URL(resolvingBookmarkData:)` - Converts bookmark back to URL
   - `startAccessingSecurityScopedResource()` - Restores access
5. Now `expo-file-system` can access the folder normally

## References

- [Apple: Accessing Security-Scoped Resources](https://developer.apple.com/documentation/foundation/url/1417051-startaccessingsecurityscopedreso)
- [Expo Modules API](https://docs.expo.dev/modules/overview/)
- [@react-native-documents/picker](https://github.com/nickhartdev/react-native-documents-picker)
