<?php

namespace App\Http\Controllers;

use App\Models\Queue;
use App\Models\Patient;
use App\Models\Consultation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class QueueController extends Controller
{
    public function index(): Response
    {
        $todayQueue = Queue::today()
            ->with(['patient', 'consultation', 'processedBy'])
            ->orderBy('queue_number')
            ->get();

        $waitingCount = $todayQueue->where('status', 'waiting')->count();
        $inProgressCount = $todayQueue->where('status', 'in_progress')->count();
        $completedCount = $todayQueue->where('status', 'completed')->count();

        return Inertia::render('queue/index', [
            'queue' => $todayQueue,
            'stats' => [
                'waiting' => $waitingCount,
                'in_progress' => $inProgressCount,
                'completed' => $completedCount,
                'total' => $todayQueue->count(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('queue/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'age' => 'required|integer|min:0|max:130',
            'gender' => 'required|in:male,female,other',
        ]);

        $queueNumber = Queue::getNextQueueNumber();

        $queueItem = Queue::create([
            'name' => $validated['name'],
            'age' => $validated['age'],
            'gender' => $validated['gender'],
            'status' => 'waiting',
            'queue_number' => $queueNumber,
        ]);

        return redirect()->route('queue.index')
            ->with('success', "Patient {$validated['name']} added to queue. Queue number: {$queueNumber}");
    }

    public function process(Queue $queue)
    {
        if ($queue->status !== 'waiting') {
            return redirect()->route('queue.index')
                ->with('error', 'This queue item cannot be processed.');
        }

        // Create patient record
        $patient = Patient::create([
            'name' => $queue->name,
            'age' => $queue->age,
            'gender' => $queue->gender,
        ]);

        // Create consultation
        $consultation = Consultation::create([
            'patient_id' => $patient->id,
            'doctor_id' => auth()->id(),
            'status' => 'draft',
        ]);

        // Update queue item
        $queue->update([
            'status' => 'in_progress',
            'patient_id' => $patient->id,
            'consultation_id' => $consultation->id,
            'processed_by' => auth()->id(),
            'processed_at' => now(),
        ]);

        return redirect()->route('consultations.show', $consultation)
            ->with('success', 'Patient processed and consultation started.');
    }

    public function complete(Queue $queue)
    {
        if ($queue->status !== 'in_progress') {
            return redirect()->route('queue.index')
                ->with('error', 'This queue item cannot be completed.');
        }

        $queue->update([
            'status' => 'completed',
        ]);

        return redirect()->route('queue.index')
            ->with('success', 'Queue item marked as completed.');
    }

    public function cancel(Queue $queue)
    {
        if ($queue->status === 'completed') {
            return redirect()->route('queue.index')
                ->with('error', 'Cannot cancel a completed queue item.');
        }

        $queue->update([
            'status' => 'cancelled',
        ]);

        return redirect()->route('queue.index')
            ->with('success', 'Queue item cancelled.');
    }

    public function destroy(Queue $queue)
    {
        if ($queue->status === 'in_progress') {
            return redirect()->route('queue.index')
                ->with('error', 'Cannot delete a queue item that is in progress.');
        }

        $queue->delete();

        return redirect()->route('queue.index')
            ->with('success', 'Queue item deleted.');
    }
}