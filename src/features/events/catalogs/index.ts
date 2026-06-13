// ============================================================
// Event Catalog Registration — registers all event catalogs
// with the central event registry.
// ============================================================

import { eventRegistry } from '../registry'
import { generalEvents } from './general'
import { educationEvents } from './education'
import { careerEvents } from './career'
import { healthEvents } from './health'
import { relationshipEvents } from './relationships'

eventRegistry.registerCatalog('general', generalEvents)
eventRegistry.registerCatalog('education', educationEvents)
eventRegistry.registerCatalog('career', careerEvents)
eventRegistry.registerCatalog('health', healthEvents)
eventRegistry.registerCatalog('relationships', relationshipEvents)
