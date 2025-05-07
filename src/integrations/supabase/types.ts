export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_configuracoes: {
        Row: {
          comissao_padrao: number
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          comissao_padrao?: number
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          comissao_padrao?: number
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      agendamentos: {
        Row: {
          avaliacao_comentario: string | null
          avaliacao_nota: number | null
          created_at: string | null
          data_hora: string
          id: string
          motivo_cancelamento: string | null
          pet_id: string
          servico_id: string
          status: Database["public"]["Enums"]["agendamento_status"]
          tutor_id: string
          updated_at: string | null
          valor_pago: number
          veterinario_id: string
        }
        Insert: {
          avaliacao_comentario?: string | null
          avaliacao_nota?: number | null
          created_at?: string | null
          data_hora: string
          id?: string
          motivo_cancelamento?: string | null
          pet_id: string
          servico_id: string
          status?: Database["public"]["Enums"]["agendamento_status"]
          tutor_id: string
          updated_at?: string | null
          valor_pago: number
          veterinario_id: string
        }
        Update: {
          avaliacao_comentario?: string | null
          avaliacao_nota?: number | null
          created_at?: string | null
          data_hora?: string
          id?: string
          motivo_cancelamento?: string | null
          pet_id?: string
          servico_id?: string
          status?: Database["public"]["Enums"]["agendamento_status"]
          tutor_id?: string
          updated_at?: string | null
          valor_pago?: number
          veterinario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_pet_id_fkey"
            columns: ["pet_id"]
            isOneToOne: false
            referencedRelation: "pets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_veterinario_id_fkey"
            columns: ["veterinario_id"]
            isOneToOne: false
            referencedRelation: "veterinarios"
            referencedColumns: ["id"]
          },
        ]
      }
      comissoes_servicos: {
        Row: {
          created_at: string | null
          fixa: boolean
          id: string
          percentual: number
          servico_id: string | null
          updated_at: string | null
          valor_fixo: number | null
        }
        Insert: {
          created_at?: string | null
          fixa?: boolean
          id?: string
          percentual: number
          servico_id?: string | null
          updated_at?: string | null
          valor_fixo?: number | null
        }
        Update: {
          created_at?: string | null
          fixa?: boolean
          id?: string
          percentual?: number
          servico_id?: string | null
          updated_at?: string | null
          valor_fixo?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "comissoes_servicos_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
        ]
      }
      conflitos: {
        Row: {
          agendamento_id: string
          created_at: string | null
          descricao: string
          estorno_aprovado: boolean | null
          estorno_solicitado: boolean
          id: string
          resolvido: boolean
          status: string
          titulo: string
          tutor_id: string
          updated_at: string | null
          valor_estorno: number | null
          veterinario_id: string
        }
        Insert: {
          agendamento_id: string
          created_at?: string | null
          descricao: string
          estorno_aprovado?: boolean | null
          estorno_solicitado?: boolean
          id?: string
          resolvido?: boolean
          status?: string
          titulo: string
          tutor_id: string
          updated_at?: string | null
          valor_estorno?: number | null
          veterinario_id: string
        }
        Update: {
          agendamento_id?: string
          created_at?: string | null
          descricao?: string
          estorno_aprovado?: boolean | null
          estorno_solicitado?: boolean
          id?: string
          resolvido?: boolean
          status?: string
          titulo?: string
          tutor_id?: string
          updated_at?: string | null
          valor_estorno?: number | null
          veterinario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conflitos_agendamento_id_fkey"
            columns: ["agendamento_id"]
            isOneToOne: false
            referencedRelation: "agendamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conflitos_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conflitos_veterinario_id_fkey"
            columns: ["veterinario_id"]
            isOneToOne: false
            referencedRelation: "veterinarios"
            referencedColumns: ["id"]
          },
        ]
      }
      disponibilidade_veterinario: {
        Row: {
          created_at: string | null
          dia_semana: number
          hora_fim: string
          hora_inicio: string
          id: string
          intervalo_minutos: number | null
          updated_at: string | null
          veterinario_id: string
        }
        Insert: {
          created_at?: string | null
          dia_semana: number
          hora_fim: string
          hora_inicio: string
          id?: string
          intervalo_minutos?: number | null
          updated_at?: string | null
          veterinario_id: string
        }
        Update: {
          created_at?: string | null
          dia_semana?: number
          hora_fim?: string
          hora_inicio?: string
          id?: string
          intervalo_minutos?: number | null
          updated_at?: string | null
          veterinario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "disponibilidade_veterinario_veterinario_id_fkey"
            columns: ["veterinario_id"]
            isOneToOne: false
            referencedRelation: "veterinarios"
            referencedColumns: ["id"]
          },
        ]
      }
      mensagens_conflitos: {
        Row: {
          conflito_id: string
          created_at: string | null
          id: string
          mensagem: string
          tipo_usuario: string
          user_id: string
        }
        Insert: {
          conflito_id: string
          created_at?: string | null
          id?: string
          mensagem: string
          tipo_usuario: string
          user_id: string
        }
        Update: {
          conflito_id?: string
          created_at?: string | null
          id?: string
          mensagem?: string
          tipo_usuario?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mensagens_conflitos_conflito_id_fkey"
            columns: ["conflito_id"]
            isOneToOne: false
            referencedRelation: "conflitos"
            referencedColumns: ["id"]
          },
        ]
      }
      pets: {
        Row: {
          created_at: string | null
          data_nascimento: string | null
          especie: string
          id: string
          nome: string
          peso: number | null
          raca: string | null
          sexo: Database["public"]["Enums"]["pet_sexo"] | null
          tutor_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_nascimento?: string | null
          especie: string
          id?: string
          nome: string
          peso?: number | null
          raca?: string | null
          sexo?: Database["public"]["Enums"]["pet_sexo"] | null
          tutor_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_nascimento?: string | null
          especie?: string
          id?: string
          nome?: string
          peso?: number | null
          raca?: string | null
          sexo?: Database["public"]["Enums"]["pet_sexo"] | null
          tutor_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pets_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "tutores"
            referencedColumns: ["id"]
          },
        ]
      }
      servicos: {
        Row: {
          created_at: string | null
          descricao: string | null
          duracao_minutos: number
          id: string
          nome: string
          preco: number
          updated_at: string | null
          veterinario_id: string
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          duracao_minutos: number
          id?: string
          nome: string
          preco: number
          updated_at?: string | null
          veterinario_id: string
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          duracao_minutos?: number
          id?: string
          nome?: string
          preco?: number
          updated_at?: string | null
          veterinario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "servicos_veterinario_id_fkey"
            columns: ["veterinario_id"]
            isOneToOne: false
            referencedRelation: "veterinarios"
            referencedColumns: ["id"]
          },
        ]
      }
      tutores: {
        Row: {
          cep: string | null
          cidade: string | null
          created_at: string | null
          email: string
          estado: string | null
          id: string
          nome: string
          telefone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cep?: string | null
          cidade?: string | null
          created_at?: string | null
          email: string
          estado?: string | null
          id?: string
          nome: string
          telefone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cep?: string | null
          cidade?: string | null
          created_at?: string | null
          email?: string
          estado?: string | null
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
      veterinarios: {
        Row: {
          bairro: string | null
          bio: string | null
          cep: string | null
          cidade: string | null
          cpf: string | null
          created_at: string | null
          crm: string
          crmv_document_url: string | null
          email: string
          especialidades: string[] | null
          estado: string | null
          estado_crm: string
          foto_perfil: string | null
          id: string
          latitude: number | null
          longitude: number | null
          nome_completo: string
          numero: string | null
          rg: string | null
          rua: string | null
          status_aprovacao: Database["public"]["Enums"]["aprovacao_status"]
          telefone: string | null
          tipo_atendimento: Database["public"]["Enums"]["atendimento_tipo"]
          updated_at: string | null
          user_id: string | null
          valor_minimo: number | null
        }
        Insert: {
          bairro?: string | null
          bio?: string | null
          cep?: string | null
          cidade?: string | null
          cpf?: string | null
          created_at?: string | null
          crm: string
          crmv_document_url?: string | null
          email: string
          especialidades?: string[] | null
          estado?: string | null
          estado_crm: string
          foto_perfil?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome_completo: string
          numero?: string | null
          rg?: string | null
          rua?: string | null
          status_aprovacao?: Database["public"]["Enums"]["aprovacao_status"]
          telefone?: string | null
          tipo_atendimento?: Database["public"]["Enums"]["atendimento_tipo"]
          updated_at?: string | null
          user_id?: string | null
          valor_minimo?: number | null
        }
        Update: {
          bairro?: string | null
          bio?: string | null
          cep?: string | null
          cidade?: string | null
          cpf?: string | null
          created_at?: string | null
          crm?: string
          crmv_document_url?: string | null
          email?: string
          especialidades?: string[] | null
          estado?: string | null
          estado_crm?: string
          foto_perfil?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome_completo?: string
          numero?: string | null
          rg?: string | null
          rua?: string | null
          status_aprovacao?: Database["public"]["Enums"]["aprovacao_status"]
          telefone?: string | null
          tipo_atendimento?: Database["public"]["Enums"]["atendimento_tipo"]
          updated_at?: string | null
          user_id?: string | null
          valor_minimo?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      agendamento_status: "pendente" | "confirmado" | "realizado" | "cancelado"
      aprovacao_status: "pendente" | "aprovado" | "rejeitado"
      atendimento_tipo: "domicilio" | "clinica" | "ambos"
      pet_sexo: "macho" | "femea"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      agendamento_status: ["pendente", "confirmado", "realizado", "cancelado"],
      aprovacao_status: ["pendente", "aprovado", "rejeitado"],
      atendimento_tipo: ["domicilio", "clinica", "ambos"],
      pet_sexo: ["macho", "femea"],
    },
  },
} as const
