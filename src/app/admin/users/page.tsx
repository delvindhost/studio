
import { UserManagement } from "@/components/admin/UserManagement";
import { getUsers, createUser, deleteUser } from "@/app/admin/actions";
import { Users } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-primary flex items-center gap-3">
          <Users className="size-8 text-accent" />
          Gerenciamento de Usuários
        </h1>
      </div>
      <UserManagement
        getUsersAction={getUsers}
        createUserAction={createUser}
        deleteUserAction={deleteUser}
      />
    </div>
  );
}
