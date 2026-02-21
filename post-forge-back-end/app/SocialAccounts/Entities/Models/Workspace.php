<?php

declare(strict_types=1);

namespace App\SocialAccounts\Entities\Models;

use App\Foundation\Entities\Models\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Workspace extends Model
{
    protected $table = 'workspaces';

    /**
     * Get the social accounts for the workspace.
     */
    public function socialAccounts(): HasMany
    {
        return $this->hasMany(SocialAccount::class);
    }
}
