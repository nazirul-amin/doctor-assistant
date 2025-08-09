<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            'view queue',
            'add queue',
            'process queue',
            'cancel queue',
            'view consultation'
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission);
        }

        // Create roles and assign created permissions
        $clinicAssistant = Role::findOrCreate('clinic assistant');
        $clinicAssistant->syncPermissions([
            'view queue',
            'add queue'
        ]);

        $doctor = Role::findOrCreate('doctor');
        $doctor->syncPermissions([
            'view queue',
            'process queue',
            'cancel queue',
            'view consultation'
        ]);

        // Create clinic assistant user
        $clinicAssistantUser = User::firstOrCreate(
            ['email' => 'assistant@example.com'],
            [
                'name' => 'Clinic Assistant',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );
        $clinicAssistantUser->assignRole('clinic assistant');

        // Create doctor user
        $doctorUser = User::firstOrCreate(
            ['email' => 'doctor@example.com'],
            [
                'name' => 'Doctor',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );
        $doctorUser->assignRole('doctor');
    }
}
