import { useCallback, useEffect, useState } from 'react'
import { AxiosError } from 'axios'
import {
  createGroup,
  deleteGroup,
  getGroups,
  updateGroup,
  type CreateGroupPayload,
  type GroupQueryParams,
  type GroupSummary,
  type UpdateGroupPayload,
} from '../api/groups'

interface UseGroupsResult {
  groups: GroupSummary[]
  total: number
  page: number
  limit: number
  isLoading: boolean
  error: string | null
  search: string
  statusFilter: 'all' | 'active' | 'inactive'
  setSearch: (value: string) => void
  setStatusFilter: (value: 'all' | 'active' | 'inactive') => void
  setPage: (page: number) => void
  refetch: () => Promise<void>
  addGroup: (payload: CreateGroupPayload) => Promise<void>
  editGroup: (id: string, payload: UpdateGroupPayload) => Promise<void>
  removeGroup: (id: string) => Promise<void>
}

const getErrorMessage = (error: unknown) => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message
    if (typeof message === 'string') {
      return message
    }
  }

  return "Guruhlar ro'yxatini yuklab bo'lmadi"
}

export const useGroups = (initialLimit = 10): UseGroupsResult => {
  const [groups, setGroups] = useState<GroupSummary[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(initialLimit)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGroups = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params: GroupQueryParams = {
        page,
        limit,
      }

      if (search) {
        params.search = search
      }

      if (statusFilter !== 'all') {
        params.isActive = statusFilter === 'active'
      }

      const response = await getGroups(params)
      setGroups(response.data)
      setTotal(response.meta.total)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setIsLoading(false)
    }
  }, [limit, page, search, statusFilter])

  useEffect(() => {
    void fetchGroups()
  }, [fetchGroups])

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter])

  return {
    groups,
    total,
    page,
    limit,
    isLoading,
    error,
    search,
    statusFilter,
    setSearch,
    setStatusFilter,
    setPage,
    refetch: fetchGroups,
    addGroup: async (payload) => {
      await createGroup(payload)
      await fetchGroups()
    },
    editGroup: async (id, payload) => {
      await updateGroup(id, payload)
      await fetchGroups()
    },
    removeGroup: async (id) => {
      await deleteGroup(id)
      await fetchGroups()
    },
  }
}
