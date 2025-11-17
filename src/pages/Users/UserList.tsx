import { useEffect, useState } from 'react';
import { Plus, Shield, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usersApi } from '@/lib/api';

export default function UserList() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const data = await usersApi.getAll();
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Users</h1>
          <p className="text-muted-foreground">Manage system users</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create User
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading users...</div>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <Card key={user.id} className="p-6 border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{user.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Badge variant={user.user_roles?.[0]?.role === 'admin' ? 'default' : 'secondary'}>
                  {user.user_roles?.[0]?.role || 'user'}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
