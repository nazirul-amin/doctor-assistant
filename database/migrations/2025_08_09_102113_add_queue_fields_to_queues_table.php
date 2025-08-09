<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('queues', function (Blueprint $table) {
            $table->string('name')->after('id');
            $table->unsignedInteger('age')->after('name');
            $table->enum('gender', ['male', 'female', 'other'])->after('age');
            $table->enum('status', ['waiting', 'in_progress', 'completed', 'cancelled'])->default('waiting')->after('gender');
            $table->unsignedBigInteger('patient_id')->nullable()->after('status');
            $table->unsignedBigInteger('consultation_id')->nullable()->after('patient_id');
            $table->unsignedBigInteger('processed_by')->nullable()->after('consultation_id');
            $table->timestamp('processed_at')->nullable()->after('processed_by');
            $table->integer('queue_number')->after('processed_at');

            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
            $table->foreign('consultation_id')->references('id')->on('consultations')->onDelete('cascade');
            $table->foreign('processed_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('queues', function (Blueprint $table) {
            $table->dropForeign(['patient_id']);
            $table->dropForeign(['consultation_id']);
            $table->dropForeign(['processed_by']);
            $table->dropColumn([
                'name', 'age', 'gender', 'status', 'patient_id', 
                'consultation_id', 'processed_by', 'processed_at', 'queue_number'
            ]);
        });
    }
};
