
/**
 * Utility function to check if a ticket has expired based on its kickoff time
 * @param kickoffTime The kickoff time of the ticket
 * @returns Whether the ticket has expired (kickoff time is in the past)
 */
export const isTicketExpired = (kickoffTime: string): boolean => {
  if (!kickoffTime) return false;
  return new Date(kickoffTime) < new Date();
};
