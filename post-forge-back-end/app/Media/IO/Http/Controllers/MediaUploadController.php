<?php

declare(strict_types=1);

namespace App\Media\IO\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

final class MediaUploadController
{
    public function __invoke(Request $request): JsonResponse
    {
        $request->validate([
            'file' => [
                'required',
                'file',
                'max:51200', // 50 MB
                'mimes:jpg,jpeg,png,gif,webp,mp4,mov',
            ],
        ]);

        $file = $request->file('file');
        $path = $file->store('media', 'public');

        return response()->json([
            'url' => Storage::disk('public')->url($path),
        ]);
    }
}
