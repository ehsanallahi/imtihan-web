import { newEnforcer, Model } from 'casbin'
import { PrismaAdapter } from 'casbin-prisma-adapter'

// Casbin RBAC model definition
const modelText = `
[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act

[role_definition]
g = _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub) && (r.obj == p.obj || p.obj == '*') && (r.act == p.act || p.act == '*')
`

// Cache enforcer for reuse
let enforcer = null

async function getEnforcer() {
  if (enforcer) return enforcer

  const model = new Model()
  model.loadModelFromText(modelText)
  
  // The adapter will automatically use the Prisma client
  const adapter = await PrismaAdapter.newAdapter()
  enforcer = await newEnforcer(model, adapter)
  
  return enforcer
}

export async function checkPermission(role, resource, action) {
  const ef = await getEnforcer()
  return await ef.enforce(role, resource, action)
}
