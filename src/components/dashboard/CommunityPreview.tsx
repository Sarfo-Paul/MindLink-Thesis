import { Card } from "../shared/Card";
import type { CommunityPost } from "../../types";

interface CommunityPreviewProps {
  posts: CommunityPost[];
}

export function CommunityPreview({ posts }: CommunityPreviewProps) {
  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Community Board</h3>
        <button className="text-purple-600 font-medium hover:text-purple-700 text-sm">
          View all
        </button>
      </div>
      <Card className="p-4 h-full flex flex-col">
        <div className="space-y-3 flex-1">
          {posts.map((post) => (
            <div key={post.id} className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 font-semibold text-xs">
                  {post.author[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{post.title}</p>
                <p className="text-xs text-gray-600">
                  {post.comments} comments • {post.timeAgo}
                </p>
              </div>
            </div>
          ))}
        </div>
        <button className="w-fit mt-3 text-purple-600 font-medium hover:text-purple-700 text-sm">
          Join discussion
        </button>
      </Card>
    </section>
  );
}

