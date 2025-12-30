import ExpoModulesCore

public class BookmarkResolverModule: Module {
  // Keep track of resolved URLs so we can stop accessing them later
  private var accessedURLs: [String: URL] = [:]

  public func definition() -> ModuleDefinition {
    Name("BookmarkResolver")

    // Resolve bookmark and start accessing security-scoped resource
    AsyncFunction("resolveBookmark") { (bookmarkBase64: String) -> Bool in
      guard let bookmarkData = Data(base64Encoded: bookmarkBase64) else {
        throw NSError(
          domain: "BookmarkResolver",
          code: 1,
          userInfo: [NSLocalizedDescriptionKey: "Invalid bookmark data - not valid base64"]
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
        // Bookmark is stale but might still work - log warning
        print("[BookmarkResolver] Warning: Bookmark is stale for URL: \(url.path)")
      }

      let success = url.startAccessingSecurityScopedResource()
      if success {
        // Store the URL so we can stop accessing it later
        self.accessedURLs[url.absoluteString] = url
        print("[BookmarkResolver] Successfully started accessing: \(url.path)")
      } else {
        print("[BookmarkResolver] Failed to start accessing security-scoped resource: \(url.path)")
      }

      return success
    }

    // Stop accessing a security-scoped resource
    AsyncFunction("stopAccessing") { (uri: String) -> Void in
      if let url = self.accessedURLs[uri] {
        url.stopAccessingSecurityScopedResource()
        self.accessedURLs.removeValue(forKey: uri)
        print("[BookmarkResolver] Stopped accessing: \(url.path)")
      } else if let url = URL(string: uri) {
        // Try to stop accessing even if we don't have it tracked
        url.stopAccessingSecurityScopedResource()
        print("[BookmarkResolver] Stopped accessing (untracked): \(url.path)")
      }
    }

    // Stop accessing all resources (for cleanup)
    AsyncFunction("stopAccessingAll") { () -> Void in
      for (_, url) in self.accessedURLs {
        url.stopAccessingSecurityScopedResource()
      }
      self.accessedURLs.removeAll()
      print("[BookmarkResolver] Stopped accessing all security-scoped resources")
    }
  }
}
