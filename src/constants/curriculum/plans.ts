/**
 * كل خطط المناهج (دورة لكل خطة).
 */
import type { CoursePlan } from './types';
import { PY_BASICS_PLAN } from './python/basics';
import { PY_DS_PLAN } from './python/data-structures';
import { PY_OOP_PLAN } from './python/oop';
import { PY_ADVANCED_PLAN } from './python/advanced';
import { CPP_BASICS_PLAN } from './cpp/basics';
import { CPP_POINTERS_PLAN } from './cpp/pointers';
import { CPP_OOP_PLAN } from './cpp/oop';
import { CPP_ADVANCED_PLAN } from './cpp/advanced';
import { WEB_HTML_PLAN } from './web/html';
import { WEB_CSS_PLAN } from './web/css';
import { WEB_CSS_ADVANCED_PLAN } from './web/css-advanced';
import { WEB_JS_PLAN } from './web/js';
import { WEB_REACT_PLAN } from './web/react';
import { WEB_DEPLOY_PLAN } from './web/deploy';
import { AI_ML_PLAN } from './ai/ml';
import { AI_DL_PLAN } from './ai/dl';
import { AI_BASICS_PLAN } from './ai/basics';
import { RN_BASICS_PLAN, RN_ADVANCED_PLAN, FLUTTER_BASICS_PLAN, FLUTTER_ADVANCED_PLAN } from './mobile/mobile';
import { BACKEND_NODE_PLAN, BACKEND_REST_PLAN } from './backend/node-rest';
import { BACKEND_AUTH_PLAN } from './backend/auth';
import { BACKEND_SQL_PLAN, BACKEND_MONGO_PLAN } from './backend/data';
import { BACKEND_SUPABASE_PLAN, BACKEND_FIREBASE_PLAN } from './backend/baas';
import { CYBER_BASICS_PLAN, CYBER_NETWORK_PLAN, CYBER_ADVANCED_PLAN, CYBER_ETHICAL_PLAN } from './cyber/structural';

export const CURRICULUM_PLANS: CoursePlan[] = [PY_BASICS_PLAN, PY_DS_PLAN, PY_OOP_PLAN, PY_ADVANCED_PLAN, CPP_BASICS_PLAN, CPP_POINTERS_PLAN, CPP_OOP_PLAN, CPP_ADVANCED_PLAN, WEB_HTML_PLAN, WEB_CSS_PLAN, WEB_CSS_ADVANCED_PLAN, WEB_JS_PLAN, WEB_REACT_PLAN, WEB_DEPLOY_PLAN, AI_ML_PLAN, AI_DL_PLAN, AI_BASICS_PLAN, RN_BASICS_PLAN, RN_ADVANCED_PLAN, FLUTTER_BASICS_PLAN, FLUTTER_ADVANCED_PLAN, BACKEND_NODE_PLAN, BACKEND_REST_PLAN, BACKEND_AUTH_PLAN, BACKEND_SQL_PLAN, BACKEND_MONGO_PLAN, BACKEND_SUPABASE_PLAN, BACKEND_FIREBASE_PLAN, CYBER_BASICS_PLAN, CYBER_NETWORK_PLAN, CYBER_ADVANCED_PLAN, CYBER_ETHICAL_PLAN];
