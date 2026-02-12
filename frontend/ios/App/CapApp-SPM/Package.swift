// swift-tools-version: 5.7
import PackageDescription

let package = Package(
    name: "CapApp-SPM",
    platforms: [.iOS(.v13)],
    products: [
        .library(
            name: "CapApp-SPM",
            targets: ["CapApp-SPM"])
    ],
    targets: [
        .target(
            name: "CapApp-SPM",
            dependencies: [
                "Capacitor",
                "Cordova"
            ]
        ),
        .binaryTarget(
            name: "Capacitor",
            path: "Capacitor.xcframework"
        ),
        .binaryTarget(
            name: "Cordova",
            path: "Cordova.xcframework"
        )
    ]
)
