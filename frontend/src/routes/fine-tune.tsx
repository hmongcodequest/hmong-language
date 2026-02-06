import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import {
  Loader2,
  AlertCircle,
  Play,
  RotateCw,
  Cpu,
  Database,
  Square,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/fine-tune")({
  component: FineTunePage,
});

function FineTunePage() {
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string>("");
  const [status, setStatus] = useState<
    "idle" | "training" | "completed" | "error"
  >("idle");
  const [datasetCount, setDatasetCount] = useState<number | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check dataset size
    fetch("http://localhost:8000/dataset/count")
      .then((res) => res.json())
      .then((data) => setDatasetCount(data.count))
      .catch((err) => console.error("Failed to fetch dataset count", err));

    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleStartTraining = () => {
    setIsTraining(true);
    setError("");
    setLogs([]);
    setProgress(0);
    setStatus("training");

    // Use EventSource for Server-Sent Events
    const eventSource = new EventSource("http://localhost:8000/train/stream");
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "log" || data.type === "start") {
          setLogs((prev) => [...prev, data.message]);
          if (data.progress !== undefined) {
            setProgress(data.progress);
          }
        } else if (data.type === "complete") {
          setLogs((prev) => [...prev, data.message]);
          setProgress(100);
          setStatus("completed");
          setIsTraining(false);
          eventSource.close();
        } else if (data.type === "error") {
          setError(data.message);
          setStatus("error");
          setIsTraining(false);
          eventSource.close();
        }
      } catch (e) {
        console.error("Failed to parse SSE data:", e);
      }
    };

    eventSource.onerror = (err) => {
      console.error("EventSource error:", err);
      // Check if it's a normal close or actual error
      if (eventSource.readyState === EventSource.CLOSED) {
        // Connection was closed normally
        if (status !== "completed" && status !== "error") {
          setStatus("completed");
          setIsTraining(false);
        }
      } else {
        setError("Connection to training server lost");
        setStatus("error");
        setIsTraining(false);
      }
      eventSource.close();
    };
  };

  const handleStopTraining = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      setLogs((prev) => [...prev, "⏹️ Training interrupted by user"]);
      setStatus("idle");
      setIsTraining(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <div className="space-y-6">
        <div className="space-y-2 text-center sm:text-left">
          <div className="flex items-center gap-3 justify-center sm:justify-start">
            <h1 className="text-3xl font-bold tracking-tight">
              Fine-Tune Model
            </h1>
            <Badge variant="outline" className="text-xs">
              Experimental
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Train the Whisper model on your custom Hmong dataset to improve
            accuracy.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Dataset Size
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                <Database className="h-5 w-5 text-muted-foreground" />
                {datasetCount ?? "..."} samples
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Recommended: 50+
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Base Model</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                <Cpu className="h-5 w-5 text-muted-foreground" />
                Whisper Small
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Run on{" "}
                {navigator.userAgent.includes("Win") ? "GPU (CUDA)" : "CPU"}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="w-full border-primary/20 bg-muted/5">
          <CardHeader>
            <CardTitle>Training Control</CardTitle>
            <CardDescription>
              Start the fine-tuning process. This may take several minutes
              depending on your hardware.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {status === "training" && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-2">
                    <RotateCw className="h-3 w-3 animate-spin" />
                    Training in progress...
                  </span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full h-2" />
              </div>
            )}

            <div className="bg-black/90 text-green-400 font-mono text-xs p-4 rounded-md h-64 overflow-y-auto shadow-inner">
              {logs.length === 0 ? (
                <span className="text-muted-foreground italic opacity-50">
                  Waiting to start...
                </span>
              ) : (
                <div className="space-y-1">
                  {logs.map((log, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="opacity-50 shrink-0">
                        [{new Date().toLocaleTimeString()}]
                      </span>
                      <span className="break-all">{log}</span>
                    </div>
                  ))}
                  <div ref={logsEndRef} />
                </div>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {status === "completed" && (
              <Alert className="border-green-500 text-green-600 bg-green-50/50">
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  Model successfully fine-tuned! Please restart the backend to
                  load the new weights.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            {isTraining && (
              <Button variant="destructive" onClick={handleStopTraining}>
                <Square className="mr-2 h-4 w-4 fill-current" />
                Stop
              </Button>
            )}
            <Button
              onClick={handleStartTraining}
              disabled={isTraining}
              size="lg"
            >
              {isTraining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Training...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Training
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
