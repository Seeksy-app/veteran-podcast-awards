import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Search, 
  MoreHorizontal, 
  Eye, 
  Shield, 
  ShieldCheck, 
  ShieldX,
  Mic,
  Vote,
  Heart,
  Mail,
  Calendar,
  RefreshCw,
} from "lucide-react";

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  user_type: string | null;
  created_at: string;
  bio: string | null;
}

interface UserRole {
  user_id: string;
  role: "admin" | "moderator" | "user";
}

interface UserStats {
  total: number;
  podcasters: number;
  voters: number;
  fans: number;
  admins: number;
}

export const UserManager = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [roles, setRoles] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats>({ total: 0, podcasters: 0, voters: 0, fans: 0, admins: 0 });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [users, roles]);

  const fetchUsers = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error fetching users",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setUsers(data || []);
    }
    setIsLoading(false);
  };

  const fetchRoles = async () => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("user_id, role");

    if (!error && data) {
      const roleMap = new Map<string, string>();
      data.forEach((r: UserRole) => roleMap.set(r.user_id, r.role));
      setRoles(roleMap);
    }
  };

  const calculateStats = () => {
    const newStats: UserStats = {
      total: users.length,
      podcasters: users.filter(u => u.user_type === "podcaster").length,
      voters: users.filter(u => u.user_type === "voter").length,
      fans: users.filter(u => u.user_type === "fan").length,
      admins: Array.from(roles.values()).filter(r => r === "admin").length,
    };
    setStats(newStats);
  };

  const handleRoleChange = async (userId: string, newRole: "admin" | "moderator" | "user") => {
    const currentRole = roles.get(userId);

    if (currentRole) {
      // Update existing role
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("user_id", userId);

      if (error) {
        toast({ title: "Error updating role", description: error.message, variant: "destructive" });
        return;
      }
    } else {
      // Insert new role
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: newRole });

      if (error) {
        toast({ title: "Error assigning role", description: error.message, variant: "destructive" });
        return;
      }
    }

    setRoles(new Map(roles.set(userId, newRole)));
    toast({ title: "Role updated", description: `User role changed to ${newRole}` });
  };

  const removeRole = async (userId: string) => {
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId);

    if (error) {
      toast({ title: "Error removing role", description: error.message, variant: "destructive" });
      return;
    }

    const newRoles = new Map(roles);
    newRoles.delete(userId);
    setRoles(newRoles);
    toast({ title: "Role removed", description: "User role has been removed" });
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter =
      filterType === "all" ||
      (filterType === "admin" && roles.get(user.id) === "admin") ||
      (filterType !== "admin" && user.user_type === filterType);

    return matchesSearch && matchesFilter;
  });

  const getUserTypeIcon = (type: string | null) => {
    switch (type) {
      case "podcaster": return <Mic className="w-4 h-4" />;
      case "voter": return <Vote className="w-4 h-4" />;
      case "fan": return <Heart className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const getUserTypeBadge = (type: string | null) => {
    switch (type) {
      case "podcaster": return <Badge className="bg-amber-600 text-white hover:bg-amber-600">Podcaster</Badge>;
      case "voter": return <Badge className="bg-blue-600 text-white hover:bg-blue-600">Voter</Badge>;
      case "fan": return <Badge className="bg-pink-600 text-white hover:bg-pink-600">Fan</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getRoleBadge = (userId: string) => {
    const role = roles.get(userId);
    switch (role) {
      case "super_admin": return <Badge className="bg-purple-700 text-white hover:bg-purple-700">Super Admin</Badge>;
      case "admin": return <Badge className="bg-red-600 text-white hover:bg-red-600">Admin</Badge>;
      case "moderator": return <Badge className="bg-orange-600 text-white hover:bg-orange-600">Moderator</Badge>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards — click to filter the user list */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {(
          [
            { filter: "all", count: stats.total, label: "Total Users", icon: Users, color: "text-amber-600" },
            { filter: "podcaster", count: stats.podcasters, label: "Podcasters", icon: Mic, color: "text-amber-600" },
            { filter: "voter", count: stats.voters, label: "Voters", icon: Vote, color: "text-blue-500" },
            { filter: "fan", count: stats.fans, label: "Fans", icon: Heart, color: "text-pink-500" },
            { filter: "admin", count: stats.admins, label: "Admins", icon: Shield, color: "text-red-500" },
          ] as const
        ).map((c) => (
          <Card
            key={c.filter}
            onClick={() => setFilterType(c.filter)}
            className={`cursor-pointer transition-all hover:shadow-md ${
              filterType === c.filter ? "ring-2 ring-amber-400 border-amber-300" : ""
            }`}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <c.icon className={`w-8 h-8 ${c.color}`} />
                <div>
                  <p className="text-2xl font-bold">{c.count}</p>
                  <p className="text-xs text-slate-500">{c.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User Management Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Management
              </CardTitle>
              <CardDescription>
                Manage user accounts, roles, and permissions
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchUsers}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="podcaster">Podcasters</SelectItem>
                <SelectItem value="voter">Voters</SelectItem>
                <SelectItem value="fan">Fans</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-slate-500 mx-auto mb-4" />
              <p className="text-slate-500">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-500">No users found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-[70px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className="cursor-pointer hover:bg-slate-50"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback className="text-xs">
                              {user.full_name?.charAt(0) || user.email?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">
                              {user.full_name || "No name"}
                            </p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getUserTypeBadge(user.user_type)}</TableCell>
                      <TableCell>{getRoleBadge(user.id) || <span className="text-slate-500 text-sm">—</span>}</TableCell>
                      <TableCell className="text-sm text-slate-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <Dialog>
                              <DialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => {
                                  e.preventDefault();
                                  setSelectedUser(user);
                                }}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                              </DialogTrigger>
                            </Dialog>
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel className="text-xs text-slate-500">
                              Assign Role
                            </DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleRoleChange(user.id, "admin")}>
                              <ShieldCheck className="w-4 h-4 mr-2 text-red-500" />
                              Make Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRoleChange(user.id, "moderator")}>
                              <Shield className="w-4 h-4 mr-2 text-orange-500" />
                              Make Moderator
                            </DropdownMenuItem>
                            {roles.get(user.id) && (
                              <DropdownMenuItem onClick={() => removeRole(user.id)}>
                                <ShieldX className="w-4 h-4 mr-2" />
                                Remove Role
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>View detailed information about this user</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedUser.avatar_url || undefined} />
                  <AvatarFallback className="text-xl">
                    {selectedUser.full_name?.charAt(0) || selectedUser.email?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{selectedUser.full_name || "No name"}</h3>
                  <div className="flex gap-2 mt-1">
                    {getUserTypeBadge(selectedUser.user_type)}
                    {getRoleBadge(selectedUser.id)}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <span>{selectedUser.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>Joined {new Date(selectedUser.created_at).toLocaleDateString()}</span>
                </div>
                {selectedUser.bio && (
                  <div className="pt-2">
                    <p className="text-sm text-slate-500">Bio</p>
                    <p className="text-sm">{selectedUser.bio}</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-slate-500 mb-2">Change Role</p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={roles.get(selectedUser.id) === "admin" ? "default" : "outline"}
                    onClick={() => handleRoleChange(selectedUser.id, "admin")}
                  >
                    Admin
                  </Button>
                  <Button
                    size="sm"
                    variant={roles.get(selectedUser.id) === "moderator" ? "default" : "outline"}
                    onClick={() => handleRoleChange(selectedUser.id, "moderator")}
                  >
                    Moderator
                  </Button>
                  {roles.get(selectedUser.id) && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeRole(selectedUser.id)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
