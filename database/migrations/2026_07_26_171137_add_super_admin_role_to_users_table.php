<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE users MODIFY role ENUM('administrator', 'project_manager', 'developer', 'super_admin') NOT NULL DEFAULT 'developer'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE users MODIFY role ENUM('administrator', 'project_manager', 'developer') NOT NULL DEFAULT 'developer'");
    }
};
