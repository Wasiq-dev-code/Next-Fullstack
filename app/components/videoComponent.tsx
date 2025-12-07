import Link from "next/link";
import { IVideo } from "@/model/Video.model";

export default function VideoComponent({ video }: { video: IVideo }) {
  return (
    <div className="card bg-base-100 shadow hover:shadow-lg transition-all duration-300">
      <figure className="relative px-4 pt-4">
        <Link href={`/videos/${video._id}`} className="relative group w-full">
          <div
            className="rounded-xl overflow-hidden relative w-full"
            style={{ aspectRatio: "9/16" }}
          >
            <video
              src={`${process.env.NEXT_PUBLIC_URL_ENDPOINT}/${video.videoUrl}`}
              className="w-full h-full object-cover"
              controls={video.controls}
            />
          </div>
        </Link>
      </figure>

      <div className="card-body p-4">
        <Link href={`/videos/${video._id}`}>
          <h2 className="card-title text-lg">{video.title}</h2>
        </Link>

        <p className="text-sm text-base-content/70 line-clamp-2">
          {video.description}
        </p>
      </div>
    </div>
  );
}
