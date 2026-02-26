<?php

declare(strict_types=1);

namespace App\Publishing\IO\Console;

use App\Posts\Entities\Enums\PostStatus;
use App\Posts\UseCases\Contracts\PostRepository;
use App\Publishing\IO\Jobs\PublishScheduledPostJob;
use Illuminate\Console\Command;

final class PublishScheduledPostsCommand extends Command
{
    protected $signature = 'posts:publish-scheduled';

    protected $description = 'Publish posts that have reached their scheduled time';

    public function handle(PostRepository $postRepository): int
    {
        $posts = $postRepository->findReadyToPublish();

        if ($posts->isEmpty()) {
            $this->components->info('No scheduled posts ready to publish.');

            return self::SUCCESS;
        }

        $this->components->info("Dispatching {$posts->count()} post(s) for publishing...");

        foreach ($posts as $post) {
            $postRepository->update($post->id, ['status' => PostStatus::Pending]);

            PublishScheduledPostJob::dispatch($post->id);

            $this->components->task($post->id);
        }

        return self::SUCCESS;
    }
}
