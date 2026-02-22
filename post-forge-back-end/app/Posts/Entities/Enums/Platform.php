<?php

declare(strict_types=1);

namespace App\Posts\Entities\Enums;

enum Platform: string
{
    case Twitter = 'twitter';
    case LinkedIn = 'linkedin';
    case Threads = 'threads';

    public static function fromGraphQL(string $value): self
    {
        return match (strtoupper($value)) {
            'TWITTER' => self::Twitter,
            'LINKEDIN' => self::LinkedIn,
            'THREADS' => self::Threads,
            default => throw new \InvalidArgumentException("Invalid platform: {$value}"),
        };
    }

    public function toGraphQL(): string
    {
        return strtoupper($this->value);
    }
}
