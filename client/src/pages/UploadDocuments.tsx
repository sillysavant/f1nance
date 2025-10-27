import { useState } from "react";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, Lock, CheckCircle2, FileText } from "lucide-react";

const UploadDocuments = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState("");
  const [tags, setTags] = useState("");
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload PDF, PNG, JPG, or DOCX files only.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10 MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentType) {
      toast({
        title: "Missing information",
        description: "Please select a file and document type.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate upload delay
    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      setUploading(false);
      
      toast({
        title: "Document uploaded successfully",
        description: `${selectedFile.name} has been securely uploaded.`,
      });

      // Reset form
      setSelectedFile(null);
      setDocumentType("");
      setTags("");
      setUploadProgress(0);
    }, 2500);
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-heading text-3xl font-bold mb-2">Upload Your Financial Documents</h1>
          <p className="text-muted-foreground">Securely store your tax forms, visa documents, and financial records</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-card via-card to-card/50 backdrop-blur-sm rounded-xl border border-border p-8"
        >
          {/* Drag and Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 ${
              isDragging
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/20"
                : "border-border hover:border-primary/50 hover:bg-muted/30"
            }`}
          >
            <div className="flex flex-col items-center gap-4">
              <div className={`p-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 transition-transform duration-300 ${
                isDragging ? "scale-110" : ""
              }`}>
                <Upload className="w-12 h-12 text-primary" />
              </div>
              
              <div>
                <p className="text-lg font-medium mb-1">
                  {selectedFile ? selectedFile.name : "Drag and drop your file here"}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  or click below to browse
                </p>
              </div>

              <Input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileInputChange}
                accept=".pdf,.png,.jpg,.jpeg,.docx"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <FileText className="w-4 h-4 mr-2" />
                Browse Files
              </Button>

              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                <Lock className="w-3 h-3" />
                <span>Bank-grade encryption • Max 10 MB • PDF, PNG, JPG, DOCX</span>
              </div>
            </div>
          </div>

          {/* Metadata Section */}
          {selectedFile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-8 space-y-6"
            >
              <div className="space-y-2">
                <Label htmlFor="document-type">Document Type *</Label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger id="document-type" className="bg-background border-border">
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="w2">W-2 Form</SelectItem>
                    <SelectItem value="1042s">1042-S Form</SelectItem>
                    <SelectItem value="i20">I-20 Document</SelectItem>
                    <SelectItem value="bank-statement">Bank Statement</SelectItem>
                    <SelectItem value="tuition">Tuition Receipt</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (Optional)</Label>
                <Input
                  id="tags"
                  placeholder="e.g., Tax, Visa, Bank, Tuition, Misc"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="bg-background border-border"
                />
                <p className="text-xs text-muted-foreground">Separate multiple tags with commas</p>
              </div>

              {/* Upload Progress */}
              {uploading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span>Uploading...</span>
                    <span className="text-primary">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </motion.div>
              )}

              {/* Success Animation */}
              {uploadProgress === 100 && !uploading && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 text-green-500"
                >
                  <CheckCircle2 className="w-5 h-5 animate-pulse" />
                  <span className="font-medium">Upload complete!</span>
                </motion.div>
              )}

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                disabled={uploading || !documentType}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground font-semibold"
              >
                {uploading ? "Uploading..." : "Upload Document"}
              </Button>
            </motion.div>
          )}

          {/* Security Note */}
          <div className="mt-8 p-4 bg-muted/30 border border-border rounded-lg">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-medium mb-1">Your documents are secure</p>
                <p className="text-muted-foreground">
                  All files are encrypted in transit and at rest using bank-grade security. 
                  We never share your data with third parties.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default UploadDocuments;
