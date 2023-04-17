const supportedImageExtensions: string[] = ["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp", "apng", "avif", "webp"]; // TODO more extensions

export function matchesSupportedExtension(absolutePath: string): boolean {
    var pathLower = absolutePath.toLowerCase();
    return supportedImageExtensions.some(ext => pathLower.endsWith(ext));
}