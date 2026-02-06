import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import {
  Upload,
  FileAudio,
  Loader2,
  AlertCircle,
  Mic,
  Square,
  Play,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/transcribe")({
  component: TranscribePage,
});

function TranscribePage() {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setAudioUrl(null);
    }
  }, [file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setTranscription("");
      setError("");
      setProgress(0);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const recordedFile = new File([blob], "recording.webm", {
          type: "audio/webm",
        });
        setFile(recordedFile);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError("");
      setTranscription("");
      setFile(null);
      setProgress(0);

      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("Error accessing microphone:", err);
      setError(
        "Could not access microphone. Please ensure specific permissions are granted.",
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleTranscribe = async () => {
    if (!file) return;

    setIsLoading(true);
    setError("");
    setTranscription("");
    setProgress(10); // Start progress

    const formData = new FormData();
    formData.append("file", file);

    // Simulate progress since fetch doesn't support upload progress easily without XHR
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90;
        return prev + Math.random() * 10;
      });
    }, 500);

    try {
      const response = await fetch("http://localhost:8000/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      clearInterval(progressInterval);
      setProgress(100);
      setTranscription(data.transcription);
    } catch (err: any) {
      console.error(err);
      setError(
        err.message ||
          "Failed to transcribe audio. Please ensure the backend is running.",
      );
      setProgress(0);
    } finally {
      clearInterval(progressInterval);
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-3xl">
      <div className="space-y-6">
        <div className="space-y-2 text-center sm:text-left">
          <h1 className="text-3xl font-bold tracking-tight">
            Transcribe Audio
          </h1>
          <p className="text-muted-foreground">
            Convert Hmong speech to text with the fine-tuned Whisper model.
          </p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Source Input</CardTitle>
            <CardDescription>
              Select audio source to transcribe.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="upload" disabled={isRecording}>
                  File Upload
                </TabsTrigger>
                <TabsTrigger value="record" disabled={isRecording}>
                  Microphone
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <Label htmlFor="audio-file">Upload File</Label>
                  <Input
                    id="audio-file"
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    Supported formats: MP3, WAV, M4A
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="record" className="space-y-4">
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg space-y-4 bg-muted/20">
                  {isRecording ? (
                    <div className="text-center space-y-4">
                      <div className="relative flex items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <div className="relative inline-flex rounded-full h-16 w-16 bg-red-500 items-center justify-center text-white">
                          <Mic className="h-8 w-8" />
                        </div>
                      </div>
                      <div className="text-2xl font-mono font-bold text-red-500">
                        {formatTime(recordingTime)}
                      </div>
                      <Button variant="destructive" onClick={stopRecording}>
                        <Square className="mr-2 h-4 w-4 fill-current" /> Stop
                        Recording
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="secondary"
                      size="lg"
                      className="h-24 w-24 rounded-full flex-col gap-2"
                      onClick={startRecording}
                    >
                      <Mic className="h-8 w-8" />
                      <span>Record</span>
                    </Button>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {file && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 rounded-md border p-3 bg-muted/50 text-sm animate-in slide-in-from-top-2">
                  <FileAudio className="h-5 w-5 text-primary" />
                  <div className="flex flex-col truncate flex-1">
                    <span className="font-medium truncate">{file.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB •{" "}
                      {file.type || "audio/unknown"}
                    </span>
                  </div>
                  {!isRecording && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto text-destructive hover:text-destructive"
                      onClick={() => setFile(null)}
                    >
                      Remove
                    </Button>
                  )}
                </div>

                {audioUrl && (
                  <audio controls className="w-full mt-2" src={audioUrl}>
                    Your browser does not support the audio element.
                  </audio>
                )}
              </div>
            )}

            {isLoading && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Processing...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="w-full" />
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {transcription && (
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm animate-in slide-in-from-bottom-2">
                <div className="flex flex-col space-y-1.5 p-6">
                  <h3 className="font-semibold leading-none tracking-tight flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Transcription Result
                  </h3>
                </div>
                <div className="p-6 pt-0">
                  <div className="p-4 bg-muted/50 rounded-md text-lg leading-relaxed whitespace-pre-wrap">
                    {transcription}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              onClick={handleTranscribe}
              disabled={!file || isLoading || isRecording}
              size="lg"
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Transcribing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Start Transcribe
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
