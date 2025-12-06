import { ME, TMeVo } from '@peernest/contract';

import api from '@/lib/api-client';

export async function getMyInfo() {
  return api.get<TMeVo>(ME);
}
