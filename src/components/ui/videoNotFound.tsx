import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function VideoNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Card className="w-full max-w-md rounded-3xl shadow-xl text-center">
        <CardContent className="p-10 space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <X className="h-10 w-10 text-red-500" />
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-slate-900">
              Video not found
            </h2>
            <p className="mt-2 text-slate-500">
              The video you are looking for doesn’t exist or has been removed.
            </p>
          </div>

          <Button onClick={() => window.history.back()} className="w-full">
            Go back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
