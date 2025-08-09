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
        Schema::create('queues', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->unsignedInteger('age');
            $table->enum('gender', ['male', 'female', 'other']);
            $table->enum('status', ['waiting', 'in_progress', 'completed', 'cancelled'])->default('waiting');
            $table->unsignedBigInteger('patient_id')->nullable();
            $table->unsignedBigInteger('consultation_id')->nullable();
            $table->unsignedBigInteger('processed_by')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->integer('queue_number');

            $table->foreign('patient_id')->references('id')->on('patients')->onDelete('cascade');
            $table->foreign('consultation_id')->references('id')->on('consultations')->onDelete('cascade');
            $table->foreign('processed_by')->references('id')->on('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('queues');
    }
};
