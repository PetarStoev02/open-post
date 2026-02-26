<?php

declare(strict_types=1);

namespace App\Publishing\IO\Jobs;

use App\Publishing\UseCases\PublishPostInteractor;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

final class PublishScheduledPostJob implements ShouldBeUnique, ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public array $backoff = [10, 30, 60];

    public function __construct(
        public readonly string $postId,
    ) {}

    public function uniqueId(): string
    {
        return $this->postId;
    }

    public function handle(PublishPostInteractor $interactor): void
    {
        Log::info("Publishing scheduled post: {$this->postId}");

        $interactor->execute($this->postId);

        Log::info("Successfully published scheduled post: {$this->postId}");
    }
}
