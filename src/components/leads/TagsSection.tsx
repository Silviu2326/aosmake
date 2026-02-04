import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Plus } from 'lucide-react';
import { Button } from '../ui/Button';

export function TagsSection() {
    // Mock tags
    const tags = ['enterprise', 'high-priority', 'contacted'];

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm uppercase tracking-wider text-gray-400">Tags</CardTitle>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full">
                    <Plus size={14} />
                </Button>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
                {tags.map(tag => (
                    <Badge key={tag} variant="default" className="px-3 py-1 bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 cursor-pointer">
                        {tag}
                    </Badge>
                ))}
                {tags.length === 0 && (
                    <span className="text-sm text-gray-500 italic">No tags added</span>
                )}
            </CardContent>
        </Card>
    );
}
