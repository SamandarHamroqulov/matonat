import { useCallback, useEffect, useState } from 'react'
import { AxiosError } from 'axios'
import {
  deleteGroup,
  getGroup,
  updateGroup,
  type GroupDetail,
  type UpdateGroupPayload,
} from '../api/groups'

interface UseGroupResult {
  group: GroupDetail | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  editGroup: (payload: UpdateGroupPayload) => Promise<void>
  removeGroup: () => Promise<void>
}

const getErrorMessage = (error: unknown) => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message
    if (typeof message === 'string') {
      return message
    }
  }

  return "Guruh ma'lumotlarini yuklab bo'lmadi"
}

export const useGroup = (id?: string): UseGroupResult => {
  const [group, setGroup] = useState<GroupDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchGroup = useCallback(async () => {
    if (!id) {
      setGroup(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const response = await getGroup(id)
      setGroup(response)
    } catch (requestError) {
      setError(getErrorMessage(requestError))
      setGroup(null)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    void fetchGroup()
  }, [fetchGroup])

  return {
    group,
    isLoading,
    error,
    refetch: fetchGroup,
    editGroup: async (payload) => {
      if (!id) {
        return
      }

      await updateGroup(id, payload)
      await fetchGroup()
    },
    removeGroup: async () => {
      if (!id) {
        return
      }

      await deleteGroup(id)
    },
  }
}
