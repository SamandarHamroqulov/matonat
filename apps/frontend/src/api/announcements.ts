import axiosInstance from './axios'

export interface AnnouncementAuthor {
  id: string
  fullName: string
}

export interface AnnouncementItem {
  id: string
  title: string
  content: string
  authorId: string
  sendToBot: boolean
  publishedAt: string
  createdAt: string
  author?: AnnouncementAuthor
}

export interface CreateAnnouncementPayload {
  title: string
  content: string
  sendToBot?: boolean
}

export const getAnnouncements = async () => {
  const response = await axiosInstance.get<AnnouncementItem[]>('/announcements')
  return response.data
}

export const createAnnouncement = async (payload: CreateAnnouncementPayload) => {
  const response = await axiosInstance.post<AnnouncementItem>('/announcements', payload)
  return response.data
}

export const deleteAnnouncement = async (id: string) => {
  await axiosInstance.delete(`/announcements/${id}`)
}
