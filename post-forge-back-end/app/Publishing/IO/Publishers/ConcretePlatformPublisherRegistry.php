<?php

declare(strict_types=1);

namespace App\Publishing\IO\Publishers;

use App\Publishing\UseCases\Contracts\PlatformPublisher;
use App\Publishing\UseCases\Contracts\PlatformPublisherRegistry;
use RuntimeException;

final readonly class ConcretePlatformPublisherRegistry implements PlatformPublisherRegistry
{
    /**
     * @param array<string, PlatformPublisher> $publishers
     */
    public function __construct(
        private array $publishers,
    ) {}

    public function get(string $platform): PlatformPublisher
    {
        return $this->publishers[$platform]
            ?? throw new RuntimeException("Publishing to {$platform} is not yet supported");
    }
}
