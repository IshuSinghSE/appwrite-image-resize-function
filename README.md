
# ⚡ Supported Routes

# GET /
Return a object {
  message: "Welcome to the Appwrite Function!"
}

## GET /ping
Returns a "Pong" message.

## GET /resize
Resize an image from a remote URL or local file path.

### Query Parameters
| Name        | Type    | Default | Description |
| ----------- | ------- | ------- | ----------- |
| url         | string  |         | Image URL or local file path (required) |
| width       | number  |         | Target width (required) |
| height      | number  |         | Target height (required) |
| format      | string  | webp    | Output format: webp, jpeg, png |
| quality     | number  | 80      | Output quality (1-100) |
| fit         | string  | inside  | Resize fit: cover, contain, fill, inside, outside |
| position    | string  | centre  | Position for fit modes |
| background  | string/object/array | white | Background color (hex, rgb[a], or object) |
| rotate      | number  | 0       | Degrees to rotate |
| crop        | boolean | false   | Crop to exact size |
| progressive | boolean | true    | Progressive output for jpeg/webp |
| withMetadata| boolean | false   | Preserve image metadata |

