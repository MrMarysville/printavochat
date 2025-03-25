/**
 * Determines the appropriate CSS class for a status based on its name
 * @param statusName The name of the status
 * @returns CSS class string for the status badge
 */
export function getStatusColorClass(statusName?: string): string {
  if (!statusName) return 'bg-gray-200 text-gray-800';
  
  const statusLower = statusName.toLowerCase();
  
  if (statusLower.includes('complete') || 
      statusLower.includes('done') || 
      statusLower.includes('ready') || 
      statusLower.includes('finished')) {
    return 'bg-green-100 text-green-800';
  }
  
  if (statusLower.includes('progress') || 
      statusLower.includes('working') || 
      statusLower.includes('start') || 
      statusLower.includes('production')) {
    return 'bg-blue-100 text-blue-800';
  }
  
  if (statusLower.includes('hold') || 
      statusLower.includes('wait') || 
      statusLower.includes('pending')) {
    return 'bg-yellow-100 text-yellow-800';
  }
  
  if (statusLower.includes('cancel') || 
      statusLower.includes('reject') || 
      statusLower.includes('error')) {
    return 'bg-red-100 text-red-800';
  }
  
  if (statusLower.includes('new') || 
      statusLower.includes('created') || 
      statusLower.includes('open')) {
    return 'bg-purple-100 text-purple-800';
  }
  
  if (statusLower.includes('shipped') || 
      statusLower.includes('delivered') || 
      statusLower.includes('sent')) {
    return 'bg-indigo-100 text-indigo-800';
  }
  
  return 'bg-gray-100 text-gray-800';
} 