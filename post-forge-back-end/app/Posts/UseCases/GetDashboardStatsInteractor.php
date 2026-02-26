<?php

declare(strict_types=1);

namespace App\Posts\UseCases;

use App\Posts\UseCases\Contracts\PostRepository;
use Carbon\Carbon;

final readonly class GetDashboardStatsInteractor
{
    public function __construct(
        private PostRepository $postRepository,
    ) {}

    public function execute(): array
    {
        $now = Carbon::now();
        $currentYear = $now->year;
        $currentMonth = $now->month;
        $lastMonth = $now->copy()->subMonth();

        return [
            'totalPostsCount' => $this->postRepository->findAll()->count(),
            'totalPostsThisMonth' => $this->postRepository->countByMonth($currentYear, $currentMonth),
            'totalPostsLastMonth' => $this->postRepository->countByMonth($lastMonth->year, $lastMonth->month),
            'scheduledPostsCount' => $this->postRepository->countByStatus('scheduled'),
            'publishedPostsCount' => $this->postRepository->countByStatus('published'),
            'draftPostsCount' => $this->postRepository->countByStatus('draft'),
            'upcomingPosts' => $this->postRepository->getUpcomingScheduled(5),
            'scheduledDates' => $this->postRepository->getScheduledDatesForMonth($currentYear, $currentMonth),
            'postDates' => $this->postRepository->getPostDatesForMonth($currentYear, $currentMonth),
        ];
    }
}
