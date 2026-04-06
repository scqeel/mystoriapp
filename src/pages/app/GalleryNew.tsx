import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Upload, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function GalleryNew() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [title, setTitle] = useState("");
  const [clientName, setClientName] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [note, setNote] = useState("");

  // Step 2
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Step 3
  const [passwordEnabled, setPasswordEnabled] = useState(false);
  const [password, setPassword] = useState("");
  const [downloadEnabled, setDownloadEnabled] = useState(true);
  const [expiryDate, setExpiryDate] = useState("");

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => [...prev, ...dropped]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files).filter((f) => f.type.startsWith("image/"));
      setFiles((prev) => [...prev, ...selected]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const uid = session.user.id;

      // Create gallery
      const { data: gallery, error: galError } = await supabase
        .from("galleries")
        .insert({
          photographer_id: uid,
          title,
          client_name: clientName,
          welcome_message: welcomeMessage,
          note,
          password_hash: passwordEnabled ? password : null,
          download_enabled: downloadEnabled,
          expires_at: expiryDate || null,
        })
        .select()
        .single();

      if (galError) throw galError;

      // Upload images
      if (files.length > 0) {
        setUploading(true);
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const ext = file.name.split(".").pop();
          const filePath = `${uid}/${gallery.id}/${crypto.randomUUID()}.${ext}`;

          const { error: upErr } = await supabase.storage
            .from("gallery-images")
            .upload(filePath, file);

          if (upErr) {
            console.error("Upload error:", upErr);
            continue;
          }

          const { data: publicUrl } = supabase.storage
            .from("gallery-images")
            .getPublicUrl(filePath);

          await supabase.from("gallery_images").insert({
            gallery_id: gallery.id,
            image_url: publicUrl.publicUrl,
            sort_order: i,
          });

          setUploadProgress(Math.round(((i + 1) / files.length) * 100));
        }
        setUploading(false);
      }

      // Log activity
      await supabase.from("activity_logs").insert({
        photographer_id: uid,
        type: "gallery_created",
        message: `Gallery "${title}" created for ${clientName}`,
      });

      toast.success("Gallery created!");
      navigate(`/app/galleries/${gallery.id}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create gallery");
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return title.trim() && clientName.trim();
    if (step === 2) return true;
    return true;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => navigate("/app/galleries")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Galleries
      </button>

      <h1 className="text-3xl font-semibold">Create Gallery</h1>

      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step >= s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
            }`}>
              {step > s ? <Check className="h-4 w-4" /> : s}
            </div>
            {s < 3 && <div className={`w-12 h-0.5 ${step > s ? "bg-primary" : "bg-secondary"}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {step === 1 && (
            <Card>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-2">
                  <Label>Gallery Title *</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Johnson Wedding" />
                </div>
                <div className="space-y-2">
                  <Label>Client Name *</Label>
                  <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="e.g. Sarah Johnson" />
                </div>
                <div className="space-y-2">
                  <Label>Welcome Message</Label>
                  <Textarea value={welcomeMessage} onChange={(e) => setWelcomeMessage(e.target.value)} placeholder="A message your client will see when they open the gallery" rows={3} />
                </div>
                <div className="space-y-2">
                  <Label>Personal Note</Label>
                  <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Private note (only you can see this)" rows={2} />
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card>
              <CardContent className="p-6 space-y-5">
                <div
                  onDrop={handleFileDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="border-2 border-dashed border-border rounded-xl p-10 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => document.getElementById("file-input")?.click()}
                >
                  <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="font-medium">Drag & drop photos here</p>
                  <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
                  <input
                    id="file-input"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>

                {files.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-3">{files.length} photo{files.length > 1 ? "s" : ""} selected</p>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto">
                      {files.map((f, i) => (
                        <div key={i} className="relative group aspect-square rounded-lg overflow-hidden bg-secondary">
                          <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                          <button
                            onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Password Protection</p>
                    <p className="text-sm text-muted-foreground">Require a password to view the gallery</p>
                  </div>
                  <Switch checked={passwordEnabled} onCheckedChange={setPasswordEnabled} />
                </div>
                {passwordEnabled && (
                  <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter gallery password" type="text" />
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Allow Downloads</p>
                    <p className="text-sm text-muted-foreground">Clients can download high-res images</p>
                  </div>
                  <Switch checked={downloadEnabled} onCheckedChange={setDownloadEnabled} />
                </div>

                <div className="space-y-2">
                  <Label>Expiry Date (optional)</Label>
                  <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
                </div>

                {uploading && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Uploading photos...</p>
                    <Progress value={uploadProgress} />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 1}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        {step < 3 ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
            Next <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleCreate} disabled={loading || uploading}>
            {loading ? "Creating..." : "Create Gallery"}
          </Button>
        )}
      </div>
    </div>
  );
}
