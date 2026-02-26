<?php

declare(strict_types=1);

namespace App\Posts\IO\GraphQL\Queries;

use App\Posts\UseCases\GetDashboardStatsInteractor;
use App\Publishing\UseCases\GetThreadsEngagementInteractor;

final readonly class DashboardStats
{
    public function __construct(
        private GetDashboardStatsInteractor $dashboardStats,
        private GetThreadsEngagementInteractor $threadsEngagement,
    ) {}

    /**
     * @param  mixed  $root
     * @param  array  $args
     */
    public function __invoke(mixed $root, array $args): array
    {
        $stats = $this->dashboardStats->execute();
        $stats['threadsEngagement'] = $this->threadsEngagement->execute();

        return $stats;
    }
}
