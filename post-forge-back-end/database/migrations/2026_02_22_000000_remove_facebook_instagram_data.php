<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Remove Facebook and Instagram social accounts and clean posts referencing those platforms.
     */
    public function up(): void
    {
        // Delete social accounts for removed platforms
        DB::table('social_accounts')
            ->whereIn('platform', ['facebook', 'instagram'])
            ->delete();

        // Remove facebook/instagram from posts' platforms JSON array
        $posts = DB::table('posts')->get(['id', 'platforms']);

        foreach ($posts as $post) {
            $platforms = json_decode($post->platforms, true);

            if (! is_array($platforms)) {
                continue;
            }

            $filtered = array_values(array_filter(
                $platforms,
                fn (string $p) => ! in_array($p, ['facebook', 'instagram', 'FACEBOOK', 'INSTAGRAM'], true)
            ));

            if (count($filtered) !== count($platforms)) {
                if (empty($filtered)) {
                    DB::table('posts')->where('id', $post->id)->delete();
                } else {
                    DB::table('posts')->where('id', $post->id)->update([
                        'platforms' => json_encode($filtered),
                    ]);
                }
            }
        }
    }

    /**
     * No rollback — removed platforms are not coming back.
     */
    public function down(): void
    {
        // Intentionally empty: data removal is not reversible.
    }
};
