/**
 * Downscales and compresses an image file client-side before upload.
 * Skips vector/animated formats (SVG, GIF) and files already small enough.
 * PNGs stay PNG (logos often rely on transparency); everything else becomes JPEG.
 */
export async function resizeImageFile(
	file: File,
	maxDimension = 512,
	quality = 0.82,
): Promise<File> {
	if (!file.type.startsWith("image/") || file.type === "image/svg+xml" || file.type === "image/gif") {
		return file;
	}

	const bitmap = await createImageBitmap(file);
	const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
	if (scale === 1 && file.size <= 300 * 1024) {
		bitmap.close();
		return file;
	}

	const width = Math.max(1, Math.round(bitmap.width * scale));
	const height = Math.max(1, Math.round(bitmap.height * scale));
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");
	if (!ctx) {
		bitmap.close();
		return file;
	}
	ctx.drawImage(bitmap, 0, 0, width, height);
	bitmap.close();

	const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
	const blob = await new Promise<Blob | null>((resolve) =>
		canvas.toBlob(resolve, outputType, quality),
	);
	if (!blob) return file;

	const ext = outputType === "image/png" ? "png" : "jpg";
	const name = `${file.name.replace(/\.[^.]+$/, "")}.${ext}`;
	return new File([blob], name, { type: outputType });
}
