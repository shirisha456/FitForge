"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  workoutSchema,
  type WorkoutFormInput,
  type WorkoutFormValues,
} from "@/lib/validation/workouts";

export type ExerciseOption = { id: string; name: string; category: string };

export function WorkoutForm({
  exercises,
  workoutId,
  defaultValues,
}: {
  exercises: ExerciseOption[];
  workoutId?: string;
  defaultValues?: WorkoutFormValues;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<WorkoutFormInput, unknown, WorkoutFormValues>({
    resolver: zodResolver(workoutSchema),
    defaultValues: defaultValues ?? {
      name: "",
      performed_at: new Date().toISOString().slice(0, 10),
      notes: "",
      exercises: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "exercises" });
  const exercisesError = form.formState.errors.exercises;
  const exercisesErrorMessage =
    exercisesError && "message" in exercisesError ? (exercisesError.message as string) : undefined;

  const [customRows, setCustomRows] = useState<Set<string>>(new Set());

  function setRowCustom(fieldId: string, isCustom: boolean) {
    setCustomRows((prev) => {
      const next = new Set(prev);
      if (isCustom) next.add(fieldId);
      else next.delete(fieldId);
      return next;
    });
  }

  async function resolveExerciseId(exercise: WorkoutFormValues["exercises"][number]) {
    if (exercise.exercise_id) return exercise.exercise_id;
    const response = await fetch("/api/exercises", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: exercise.exercise_name!.trim() }),
    });
    const body = await response.json();
    if (!response.ok) {
      throw new Error(body?.error?.message ?? "Failed to create exercise");
    }
    return body.data.id as string;
  }

  async function onSubmit(values: WorkoutFormValues) {
    setServerError(null);

    let resolvedExercises: {
      exercise_id: string;
      sets: number;
      reps: number;
      weight_kg: number | null;
      notes: string | null;
    }[];
    try {
      resolvedExercises = await Promise.all(
        values.exercises.map(async (e) => ({
          exercise_id: await resolveExerciseId(e),
          sets: e.sets,
          reps: e.reps,
          weight_kg: e.weight_kg ? Number(e.weight_kg) : null,
          notes: e.notes || null,
        })),
      );
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Failed to resolve exercises.");
      return;
    }

    const payload = {
      name: values.name,
      performed_at: values.performed_at,
      notes: values.notes || null,
      exercises: resolvedExercises,
    };

    const url = workoutId ? `/api/workouts/${workoutId}` : "/api/workouts";
    const method = workoutId ? "PUT" : "POST";
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = await response.json();

    if (!response.ok) {
      setServerError(body?.error?.message ?? "Something went wrong. Please try again.");
      return;
    }

    router.push(`/workouts/${body.data.id}`);
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workout name</FormLabel>
                  <FormControl>
                    <Input placeholder="Leg day" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="performed_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="How did it feel?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Exercises</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() =>
                append({
                  exercise_id: "",
                  exercise_name: "",
                  sets: 3,
                  reps: 10,
                  weight_kg: "",
                  notes: "",
                })
              }
            >
              <Plus className="h-4 w-4" />
              Add exercise
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No exercises added yet. Add one to get started.
              </p>
            )}
            {fields.map((arrayField, index) => (
              <div
                key={arrayField.id}
                className="grid grid-cols-2 gap-3 rounded-md border border-border p-4 sm:grid-cols-5"
              >
                {customRows.has(arrayField.id) ? (
                  <FormField
                    control={form.control}
                    name={`exercises.${index}.exercise_name`}
                    render={({ field }) => (
                      <FormItem className="col-span-2 sm:col-span-2">
                        <FormLabel>Exercise</FormLabel>
                        <FormControl>
                          <Input placeholder="Type an exercise name" {...field} />
                        </FormControl>
                        <button
                          type="button"
                          className="text-left text-xs text-muted-foreground underline underline-offset-4"
                          onClick={() => {
                            form.setValue(`exercises.${index}.exercise_name`, "");
                            setRowCustom(arrayField.id, false);
                          }}
                        >
                          Choose from list instead
                        </button>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name={`exercises.${index}.exercise_id`}
                    render={({ field }) => (
                      <FormItem className="col-span-2 sm:col-span-2">
                        <FormLabel>Exercise</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            if (value === "__custom__") {
                              form.setValue(`exercises.${index}.exercise_id`, "");
                              setRowCustom(arrayField.id, true);
                              return;
                            }
                            field.onChange(value);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an exercise" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {exercises.map((exercise) => (
                              <SelectItem key={exercise.id} value={exercise.id}>
                                {exercise.name}
                              </SelectItem>
                            ))}
                            <SelectItem value="__custom__">+ Type a new exercise</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name={`exercises.${index}.sets`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sets</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          value={(field.value as number | string | undefined) ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`exercises.${index}.reps`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reps</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          value={(field.value as number | string | undefined) ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`exercises.${index}.weight_kg`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} step="0.5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="col-span-2 flex items-end justify-end sm:col-span-5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            ))}
            {exercisesErrorMessage && (
              <p className="text-sm font-medium text-destructive">{exercisesErrorMessage}</p>
            )}
          </CardContent>
        </Card>

        {serverError && <p className="text-sm font-medium text-destructive">{serverError}</p>}

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving…" : workoutId ? "Save changes" : "Create workout"}
        </Button>
      </form>
    </Form>
  );
}
