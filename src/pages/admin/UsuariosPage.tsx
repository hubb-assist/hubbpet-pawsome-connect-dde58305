
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Usuario } from '@/shared/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { UserCheck, UserX, Trash2, Edit, Search } from 'lucide-react';

const UsuariosPage = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsuarios, setFilteredUsuarios] = useState<Usuario[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentUsuario, setCurrentUsuario] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    role: 'tutor' as 'tutor' | 'veterinary' | 'admin'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchUsuarios();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = usuarios.filter(
        user => 
          user.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.role?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsuarios(filtered);
    } else {
      setFilteredUsuarios(usuarios);
    }
  }, [searchTerm, usuarios]);

  const fetchUsuarios = async () => {
    setIsLoading(true);
    try {
      // Usar a nova função segura para buscar todos os usuários
      const { data, error } = await supabase.rpc('get_all_users');
      
      if (error) throw error;
      
      console.log("Usuários obtidos via função RPC:", data);
      
      if (data && data.length > 0) {
        setUsuarios(data);
        setFilteredUsuarios(data);
      } else {
        console.log("Nenhum usuário encontrado via RPC");
        // Caso não encontre usuários via RPC, tentar o método alternativo
        fetchUsuariosFromTables();
      }
    } catch (error) {
      console.error('Erro ao buscar usuários via RPC:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de usuários.",
        variant: "destructive",
      });
      
      // Tentar o método alternativo em caso de erro
      fetchUsuariosFromTables();
    } finally {
      setIsLoading(false);
    }
  };
  
  // Método de backup para buscar usuários das tabelas
  const fetchUsuariosFromTables = async () => {
    try {
      // Consultar user_roles para obter os papéis
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Obter dados dos tutores
      const { data: tutoresData, error: tutoresError } = await supabase
        .from('tutores')
        .select('*');
      
      if (tutoresError) throw tutoresError;

      // Obter dados dos veterinários
      const { data: vetsData, error: vetsError } = await supabase
        .from('veterinarios')
        .select('*');
      
      if (vetsError) throw vetsError;

      // Mapear os dados para o formato de Usuário
      const usuariosData: Usuario[] = [];

      // Mapear tutores
      tutoresData?.forEach(tutor => {
        const role = rolesData?.find(r => r.user_id === tutor.user_id)?.role || 'tutor';
        usuariosData.push({
          id: tutor.id,
          email: tutor.email,
          nome: tutor.nome,
          role: role as 'tutor' | 'veterinary' | 'admin',
          created_at: tutor.created_at,
          telefone: tutor.telefone
        });
      });

      // Mapear veterinários
      vetsData?.forEach(vet => {
        const role = rolesData?.find(r => r.user_id === vet.user_id)?.role || 'veterinary';
        usuariosData.push({
          id: vet.id,
          email: vet.email,
          nome: vet.nome_completo,
          role: role as 'tutor' | 'veterinary' | 'admin',
          created_at: vet.created_at,
          telefone: vet.telefone
        });
      });

      console.log("Usuários das tabelas:", usuariosData);
      setUsuarios(usuariosData);
      setFilteredUsuarios(usuariosData);
    } catch (error) {
      console.error('Erro ao buscar usuários das tabelas:', error);
    }
  };

  const handleEditUsuario = (usuario: Usuario) => {
    setCurrentUsuario(usuario);
    setFormData({
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone || '',
      role: usuario.role
    });
    setIsDialogOpen(true);
  };

  const handleDeleteUsuario = async (usuario: Usuario) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário ${usuario.nome}?`)) {
      try {
        let error;

        // Excluir com base no papel
        if (usuario.role === 'tutor') {
          const { error: deleteError } = await supabase
            .from('tutores')
            .delete()
            .eq('id', usuario.id);
          error = deleteError;
        } else if (usuario.role === 'veterinary') {
          const { error: deleteError } = await supabase
            .from('veterinarios')
            .delete()
            .eq('id', usuario.id);
          error = deleteError;
        }

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Usuário excluído com sucesso.",
        });
        
        fetchUsuarios();
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir o usuário.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUsuario) return;

    try {
      let error;

      // Atualizar com base no papel
      if (currentUsuario.role === 'tutor') {
        const { error: updateError } = await supabase
          .from('tutores')
          .update({
            nome: formData.nome,
            email: formData.email,
            telefone: formData.telefone,
          })
          .eq('id', currentUsuario.id);
        error = updateError;
      } else if (currentUsuario.role === 'veterinary') {
        const { error: updateError } = await supabase
          .from('veterinarios')
          .update({
            nome_completo: formData.nome,
            email: formData.email,
            telefone: formData.telefone,
          })
          .eq('id', currentUsuario.id);
        error = updateError;
      }

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Usuário atualizado com sucesso.",
      });
      
      setIsDialogOpen(false);
      fetchUsuarios();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o usuário.",
        variant: "destructive",
      });
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'veterinary':
        return 'bg-blue-100 text-blue-800';
      case 'tutor':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'veterinary':
        return 'Veterinário';
      case 'tutor':
        return 'Tutor';
      default:
        return role;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Gerenciamento de Usuários</h1>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            placeholder="Buscar por nome, email ou tipo de usuário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hubbpet-primary"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsuarios.length > 0 ? (
                filteredUsuarios.map((usuario) => (
                  <TableRow key={usuario.id}>
                    <TableCell className="font-medium">{usuario.nome}</TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>{usuario.telefone || '-'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(usuario.role)}`}>
                        {getRoleLabel(usuario.role)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={() => handleEditUsuario(usuario)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="text-red-500 hover:text-red-600" 
                        onClick={() => handleDeleteUsuario(usuario)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-gray-500">
                    {searchTerm ? 'Nenhum usuário encontrado com esses critérios.' : 'Nenhum usuário cadastrado.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize as informações do usuário. Clique em salvar quando terminar.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome</Label>
                <Input 
                  id="nome" 
                  value={formData.nome} 
                  onChange={(e) => setFormData({...formData, nome: e.target.value})} 
                  required 
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  required 
                />
              </div>
              
              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input 
                  id="telefone" 
                  value={formData.telefone} 
                  onChange={(e) => setFormData({...formData, telefone: e.target.value})} 
                />
              </div>
              
              <div>
                <Label htmlFor="role">Tipo de Usuário</Label>
                <Select 
                  value={formData.role}
                  onValueChange={(value: any) => setFormData({...formData, role: value})}
                  disabled
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de usuário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tutor">Tutor</SelectItem>
                    <SelectItem value="veterinary">Veterinário</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">O tipo de usuário não pode ser alterado.</p>
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar Alterações</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsuariosPage;
