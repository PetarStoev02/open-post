<?php

use App\Media\IO\Http\Controllers\MediaUploadController;
use Illuminate\Support\Facades\Route;

Route::post('/media/upload', MediaUploadController::class)
    ->name('media.upload');
