<?php

declare(strict_types=1);

namespace App\Publishing\UseCases\Contracts;

interface PlatformPublisherRegistry
{
    /**
     * Get the publisher for a given platform.
     *
     * @throws \RuntimeException If no publisher is registered for the platform
     */
    public function get(string $platform): PlatformPublisher;
}
