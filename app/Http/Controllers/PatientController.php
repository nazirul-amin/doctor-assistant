<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\Consultation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PatientController extends Controller
{
    public function index(): Response
    {
        $patients = Patient::withCount('consultations')
            ->latest()
            ->get();

        return Inertia::render('patients/index', [
            'patients' => $patients,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('patients/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'age' => 'required|integer|min:0|max:130',
            'gender' => 'required|in:male,female,other',
        ]);

        $patient = Patient::create($validated);

        // Automatically create a new consultation for the patient
        $consultation = Consultation::create([
            'patient_id' => $patient->id,
            'doctor_id' => auth()->id(),
            'status' => 'draft',
        ]);

        return redirect()->route('patients.index')
            ->with('success', 'Patient registered successfully and consultation started.');
    }

    public function show(Patient $patient): Response
    {
        $patient->load(['consultations' => function ($query) {
            $query->latest()->with('doctor');
        }]);

        return Inertia::render('patients/show', [
            'patient' => $patient,
        ]);
    }

    public function edit(Patient $patient): Response
    {
        return Inertia::render('patients/edit', [
            'patient' => $patient,
        ]);
    }

    public function update(Request $request, Patient $patient)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'age' => 'required|integer|min:0|max:130',
            'gender' => 'required|in:male,female,other',
        ]);

        $patient->update($validated);

        return redirect()->route('patients.show', $patient)
            ->with('success', 'Patient updated successfully.');
    }

    public function destroy(Patient $patient)
    {
        // Check if patient has consultations
        if ($patient->consultations()->count() > 0) {
            return redirect()->route('patients.index')
                ->with('error', 'Cannot delete patient with existing consultations.');
        }

        $patient->delete();

        return redirect()->route('patients.index')
            ->with('success', 'Patient deleted successfully.');
    }
}
