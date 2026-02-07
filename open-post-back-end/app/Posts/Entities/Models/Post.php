<?php

declare(strict_types=1);

namespace App\Posts\Entities\Models;

use App\Foundation\Entities\Models\Model;
use App\Posts\Entities\Enums\PostStatus;
use App\Posts\Entities\ValueObjects\LinkPreview;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Post extends Model
{
    protected $table = 'posts';

    protected $casts = [
        'platforms' => 'array',
        'status' => PostStatus::class,
        'scheduled_at' => 'datetime',
        'media_urls' => 'array',
        'hashtags' => 'array',
        'mentions' => 'array',
        'link_preview' => 'array',
    ];

    /**
     * Get the link preview as a value object.
     */
    public function getLinkPreviewObjectAttribute(): ?LinkPreview
    {
        return LinkPreview::fromArray($this->link_preview);
    }

    /**
     * Scope to filter posts by status.
     */
    public function scopeWithStatus($query, PostStatus $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope to filter posts scheduled between dates.
     */
    public function scopeScheduledBetween($query, string $startDate, string $endDate)
    {
        return $query->whereBetween('scheduled_at', [$startDate, $endDate]);
    }

    /**
     * Scope to get posts that need to be published.
     */
    public function scopeReadyToPublish($query)
    {
        return $query
            ->where('status', PostStatus::Scheduled)
            ->where('scheduled_at', '<=', now());
    }
}
