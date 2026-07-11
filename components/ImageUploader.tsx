"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";

type Props = {
  onSelectFile: (file: File | null) => void;
};

export default function ImageUploader({
  onSelectFile,
}: Props) {
  const [preview, setPreview] = useState("");

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];

    // 親コンポーネントへFileを渡す
    onSelectFile(file);

    // プレビュー表示
    setPreview(URL.createObjectURL(file));
  };

  const {
    getRootProps,
    getInputProps,
    isDragActive,
  } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "image/jpeg": [],
      "image/png": [],
      "image/webp": [],
    },
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:bg-gray-50"
        }`}
      >
        <input {...getInputProps()} />

        <div className="space-y-2">
          <div className="text-5xl">📷</div>

          <p className="font-semibold">
            ドラッグ＆ドロップ
          </p>

          <p className="text-gray-500">
            またはクリックして画像を選択
          </p>

          <p className="text-xs text-gray-400">
            JPG・PNG・WEBP対応
          </p>
        </div>
      </div>

      {preview && (
        <div className="flex justify-center">
          <Image
            src={preview}
            alt="プレビュー"
            width={220}
            height={320}
            className="rounded-lg border object-cover"
            unoptimized
          />
        </div>
      )}
    </div>
  );
}