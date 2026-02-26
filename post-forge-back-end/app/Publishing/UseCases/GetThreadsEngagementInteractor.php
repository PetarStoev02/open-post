<?php

declare(strict_types=1);

namespace App\Publishing\UseCases;

use App\Publishing\IO\Publishers\ThreadsPublisher;
use App\SocialAccounts\Entities\Models\Workspace;
use App\SocialAccounts\UseCases\Contracts\SocialAccountRepository;
use Carbon\Carbon;

final readonly class GetThreadsEngagementInteractor
{
    public function __construct(
        private SocialAccountRepository $socialAccountRepository,
        private ThreadsPublisher $threadsPublisher,
    ) {}

    public function execute(): ?array
    {
        $account = $this->socialAccountRepository->findByWorkspaceAndPlatform(
            Workspace::default()->id,
            'threads'
        );

        if ($account === null || $account->needsReconnect()) {
            return null;
        }

        try {
            $now = Carbon::now();
            $since = $now->copy()->subDays(30)->startOfDay()->getTimestamp();
            $until = $now->getTimestamp();

            $metrics = $this->threadsPublisher->fetchUserInsights(
                $account,
                (string) $since,
                (string) $until
            );

            $totalEngagements = $metrics['likes'] + $metrics['replies'] + $metrics['reposts'] + $metrics['quotes'];
            $engagementRate = $metrics['views'] > 0
                ? round(($totalEngagements / $metrics['views']) * 100, 2)
                : 0.0;

            return [
                'views' => $metrics['views'],
                'likes' => $metrics['likes'],
                'replies' => $metrics['replies'],
                'reposts' => $metrics['reposts'],
                'quotes' => $metrics['quotes'],
                'totalEngagements' => $totalEngagements,
                'engagementRate' => $engagementRate,
            ];
        } catch (\Throwable) {
            return null;
        }
    }
}
