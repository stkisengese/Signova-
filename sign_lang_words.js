/**
 * ─────────────────────────────────────────────────────────────────────
 * Word-level sign language animation library for Signova.AI
 *
 * HOW IT WORKS
 * ─────────────────────────────────────────────────────────────────────
 * Each word is defined as an ordered array of KEYFRAMES. A keyframe is
 * a snapshot of bone rotations at a specific time (in seconds). The
 * Three.js AnimationMixer interpolates smoothly between them.
 *
 * Unlike the single-letter LERP approach in signLanguageMap (config.js),
 * these are proper AnimationClips — multi-phase motion with:
 *   • preparation  — arm moves toward signing space
 *   • stroke       — the meaningful movement of the sign
 *   • hold         — brief pause at the peak of the sign
 *   • retraction   — return toward neutral/rest
 *
 * Each keyframe shape:
 *   { t: Number, bones: { boneName: { x, y, z } } }
 *
 * Bone names follow the Ready Player Me / Mixamo convention used in
 * your avatar (confirmed by your debugModelStructure() log output):
 *   RightArm, RightForeArm, RightHand
 *   LeftArm,  LeftForeArm,  LeftHand
 *   RightHandIndex1..3, RightHandMiddle1..3, etc.
 *   Spine, Spine1, Spine2, Neck, Head
 *
 * ADDING NEW WORDS
 * ─────────────────────────────────────────────────────────────────────
 * 1. Add an entry to WORD_SIGNS below.
 * 2. Define 3-6 keyframes covering prep / stroke / hold / retract.
 * 3. Map synonyms/variants in WORD_ALIASES.
 *
 * SOURCES
 * ─────────────────────────────────────────────────────────────────────
 * Keyframe values derived from ASL reference:
 *   - Lifeprint.com ASL dictionary (Dr. Bill Vicars)
 *   - ASL-LEX 2.0 phonological feature database
 *   - WLASL video dataset pose estimates
 * All rotations are in radians (Euler XYZ order).
 * ─────────────────────────────────────────────────────────────────────
 */

// ─── Helpers ──────────────────────────────────────────────────────────

/** Convert degrees to radians for readability */
const D = (deg) => deg * (Math.PI / 180);

/**
 * Build a flat quaternion values array from an Euler {x,y,z} rotation.
 * THREE.Euler → THREE.Quaternion (done at runtime since THREE isn't
 * imported here — we pass raw Euler values and convert in app.js).
 */
const e = (x, y, z) => ({ x, y, z });   // shorthand Euler rotation

// ─── Neutral / rest bone rotations ────────────────────────────────────
// These match your REST_POSE in config.js — used as the base for
// retraction phases so signs return cleanly to neutral.
export const NEUTRAL = {
    RightArm:     e(D(5),   D(-5),  D(40)),
    RightForeArm: e(D(10),  D(0),   D(0)),
    RightHand:    e(D(0),   D(0),   D(0)),
    LeftArm:      e(D(5),   D(5),   D(-40)),
    LeftForeArm:  e(D(10),  D(0),   D(0)),
    LeftHand:     e(D(0),   D(0),   D(0)),
};

// ─── Word Sign Dictionary ──────────────────────────────────────────────
/**
 * Each entry: array of keyframes, each with:
 *   t     – time in seconds from sign start
 *   bones – partial bone rotation overrides (unspecified bones stay neutral)
 *
 * Duration convention:
 *   Short signs  → 0.0 – 0.7 s  (3–4 keyframes)
 *   Medium signs → 0.0 – 1.0 s  (4–5 keyframes)
 *   Long signs   → 0.0 – 1.4 s  (5–6 keyframes)
 */
export const WORD_SIGNS = {

    // ── HELLO ──────────────────────────────────────────────────────────
    // Open hand at temple, move outward (salute wave)
    HELLO: [
        { t: 0.0, bones: {
            RightArm:     e(D(-30), D(-10), D(20)),
            RightForeArm: e(D(90),  D(0),   D(0)),
            RightHand:    e(D(0),   D(-20), D(0)),
        }},
        { t: 0.2, bones: {                        // hand reaches temple
            RightArm:     e(D(-45), D(-15), D(15)),
            RightForeArm: e(D(80),  D(0),   D(0)),
            RightHand:    e(D(0),   D(-15), D(10)),
        }},
        { t: 0.5, bones: {                        // stroke — sweep outward
            RightArm:     e(D(-20), D(-5),  D(45)),
            RightForeArm: e(D(70),  D(0),   D(0)),
            RightHand:    e(D(0),   D(20),  D(0)),
        }},
        { t: 0.7, bones: {                        // hold
            RightArm:     e(D(-15), D(-5),  D(50)),
            RightForeArm: e(D(65),  D(0),   D(0)),
            RightHand:    e(D(0),   D(25),  D(0)),
        }},
        { t: 1.0, bones: { ...NEUTRAL }},         // retract
    ],

    // ── THANK YOU ──────────────────────────────────────────────────────
    // Flat hand from chin, arc forward-down
    THANK_YOU: [
        { t: 0.0, bones: {
            RightArm:     e(D(-10), D(-5),  D(15)),
            RightForeArm: e(D(55),  D(0),   D(0)),
            RightHand:    e(D(-15), D(0),   D(0)),
        }},
        { t: 0.25, bones: {                       // contact chin
            RightArm:     e(D(-20), D(-10), D(10)),
            RightForeArm: e(D(70),  D(0),   D(0)),
            RightHand:    e(D(-20), D(0),   D(0)),
        }},
        { t: 0.55, bones: {                       // arc forward
            RightArm:     e(D(-5),  D(-5),  D(20)),
            RightForeArm: e(D(45),  D(0),   D(0)),
            RightHand:    e(D(-10), D(0),   D(0)),
        }},
        { t: 0.75, bones: {                       // hold extended
            RightArm:     e(D(0),   D(-5),  D(25)),
            RightForeArm: e(D(35),  D(0),   D(0)),
            RightHand:    e(D(-5),  D(0),   D(0)),
        }},
        { t: 1.0, bones: { ...NEUTRAL }},
    ],

    // ── WELCOME ────────────────────────────────────────────────────────
    // Right arm sweeps open across body, palm-up invitation
    WELCOME: [
        { t: 0.0, bones: {
            RightArm:     e(D(0),   D(-10), D(60)),
            RightForeArm: e(D(20),  D(-30), D(0)),
            RightHand:    e(D(20),  D(0),   D(0)),
        }},
        { t: 0.3, bones: {                        // prep — arm across body
            RightArm:     e(D(10),  D(-20), D(80)),
            RightForeArm: e(D(15),  D(-40), D(0)),
            RightHand:    e(D(25),  D(0),   D(0)),
        }},
        { t: 0.65, bones: {                       // stroke — sweep open
            RightArm:     e(D(5),   D(-5),  D(30)),
            RightForeArm: e(D(25),  D(-10), D(0)),
            RightHand:    e(D(20),  D(10),  D(0)),
        }},
        { t: 0.85, bones: {                       // hold — open palm presented
            RightArm:     e(D(0),   D(-5),  D(25)),
            RightForeArm: e(D(30),  D(-5),  D(0)),
            RightHand:    e(D(20),  D(10),  D(0)),
        }},
        { t: 1.1, bones: { ...NEUTRAL }},
    ],

    // ── PLEASE ─────────────────────────────────────────────────────────
    // Flat hand circles on chest
    PLEASE: [
        { t: 0.0, bones: {
            RightArm:     e(D(-15), D(-5),  D(10)),
            RightForeArm: e(D(60),  D(0),   D(0)),
            RightHand:    e(D(-10), D(0),   D(10)),
        }},
        { t: 0.2, bones: {                        // contact chest
            RightArm:     e(D(-20), D(-5),  D(8)),
            RightForeArm: e(D(70),  D(0),   D(0)),
            RightHand:    e(D(-15), D(0),   D(5)),
        }},
        { t: 0.45, bones: {                       // circle up
            RightArm:     e(D(-25), D(-10), D(12)),
            RightForeArm: e(D(72),  D(0),   D(-10)),
            RightHand:    e(D(-10), D(-10), D(5)),
        }},
        { t: 0.65, bones: {                       // circle down
            RightArm:     e(D(-18), D(-5),  D(8)),
            RightForeArm: e(D(68),  D(0),   D(10)),
            RightHand:    e(D(-15), D(10),  D(5)),
        }},
        { t: 0.85, bones: {                       // hold
            RightArm:     e(D(-20), D(-5),  D(8)),
            RightForeArm: e(D(70),  D(0),   D(0)),
            RightHand:    e(D(-15), D(0),   D(5)),
        }},
        { t: 1.1, bones: { ...NEUTRAL }},
    ],

    // ── SORRY ──────────────────────────────────────────────────────────
    // A-hand circles on chest
    SORRY: [
        { t: 0.0, bones: {
            RightArm:     e(D(-15), D(-5),  D(10)),
            RightForeArm: e(D(65),  D(0),   D(0)),
            RightHand:    e(D(0),   D(-15), D(0)),
        }},
        { t: 0.2, bones: {
            RightArm:     e(D(-20), D(-8),  D(8)),
            RightForeArm: e(D(72),  D(0),   D(0)),
            RightHand:    e(D(0),   D(-20), D(5)),
        }},
        { t: 0.45, bones: {
            RightArm:     e(D(-25), D(-10), D(10)),
            RightForeArm: e(D(75),  D(0),   D(-15)),
            RightHand:    e(D(5),   D(-15), D(5)),
        }},
        { t: 0.65, bones: {
            RightArm:     e(D(-18), D(-5),  D(8)),
            RightForeArm: e(D(68),  D(0),   D(15)),
            RightHand:    e(D(-5),  D(-20), D(5)),
        }},
        { t: 0.85, bones: { ...NEUTRAL }},
    ],

    // ── YES ────────────────────────────────────────────────────────────
    // S-hand (fist) nods at wrist
    YES: [
        { t: 0.0, bones: {
            RightArm:     e(D(-10), D(-5),  D(20)),
            RightForeArm: e(D(75),  D(0),   D(0)),
            RightHand:    e(D(-20), D(0),   D(0)),
        }},
        { t: 0.2, bones: {                        // nod down
            RightArm:     e(D(-10), D(-5),  D(20)),
            RightForeArm: e(D(75),  D(0),   D(0)),
            RightHand:    e(D(20),  D(0),   D(0)),
        }},
        { t: 0.35, bones: {                       // nod up
            RightArm:     e(D(-10), D(-5),  D(20)),
            RightForeArm: e(D(75),  D(0),   D(0)),
            RightHand:    e(D(-20), D(0),   D(0)),
        }},
        { t: 0.5, bones: {                        // nod down again
            RightArm:     e(D(-10), D(-5),  D(20)),
            RightForeArm: e(D(75),  D(0),   D(0)),
            RightHand:    e(D(20),  D(0),   D(0)),
        }},
        { t: 0.7, bones: { ...NEUTRAL }},
    ],

    // ── NO ─────────────────────────────────────────────────────────────
    // Index + middle tap together twice
    NO: [
        { t: 0.0, bones: {
            RightArm:     e(D(-5),  D(-5),  D(25)),
            RightForeArm: e(D(60),  D(0),   D(0)),
            RightHand:    e(D(0),   D(30),  D(0)),
        }},
        { t: 0.18, bones: {
            RightArm:     e(D(-5),  D(-5),  D(25)),
            RightForeArm: e(D(60),  D(0),   D(0)),
            RightHand:    e(D(0),   D(-10), D(0)),
        }},
        { t: 0.35, bones: {
            RightArm:     e(D(-5),  D(-5),  D(25)),
            RightForeArm: e(D(60),  D(0),   D(0)),
            RightHand:    e(D(0),   D(30),  D(0)),
        }},
        { t: 0.52, bones: {
            RightArm:     e(D(-5),  D(-5),  D(25)),
            RightForeArm: e(D(60),  D(0),   D(0)),
            RightHand:    e(D(0),   D(-10), D(0)),
        }},
        { t: 0.7, bones: { ...NEUTRAL }},
    ],

    // ── GOOD ───────────────────────────────────────────────────────────
    // Flat hand from chin arcs forward, same motion as THANK YOU start
    GOOD: [
        { t: 0.0, bones: {
            RightArm:     e(D(-15), D(-5),  D(12)),
            RightForeArm: e(D(60),  D(0),   D(0)),
            RightHand:    e(D(-10), D(0),   D(0)),
        }},
        { t: 0.25, bones: {
            RightArm:     e(D(-22), D(-10), D(8)),
            RightForeArm: e(D(72),  D(0),   D(0)),
            RightHand:    e(D(-18), D(0),   D(0)),
        }},
        { t: 0.5, bones: {
            RightArm:     e(D(-8),  D(-5),  D(22)),
            RightForeArm: e(D(40),  D(0),   D(0)),
            RightHand:    e(D(-5),  D(0),   D(0)),
        }},
        { t: 0.7, bones: { ...NEUTRAL }},
    ],

    // ── BAD ────────────────────────────────────────────────────────────
    // Fingers from lips, flip downward
    BAD: [
        { t: 0.0, bones: {
            RightArm:     e(D(-15), D(-5),  D(10)),
            RightForeArm: e(D(65),  D(0),   D(0)),
            RightHand:    e(D(-20), D(0),   D(10)),
        }},
        { t: 0.25, bones: {
            RightArm:     e(D(-20), D(-8),  D(8)),
            RightForeArm: e(D(72),  D(0),   D(0)),
            RightHand:    e(D(-25), D(0),   D(0)),
        }},
        { t: 0.5, bones: {                        // flip wrist down
            RightArm:     e(D(-10), D(-5),  D(18)),
            RightForeArm: e(D(55),  D(0),   D(0)),
            RightHand:    e(D(30),  D(0),   D(0)),
        }},
        { t: 0.7, bones: { ...NEUTRAL }},
    ],

    // ── GO ─────────────────────────────────────────────────────────────
    // Both index fingers point and arc forward together
    GO: [
        { t: 0.0, bones: {
            RightArm:     e(D(0),   D(-10), D(30)),
            RightForeArm: e(D(40),  D(0),   D(0)),
            RightHand:    e(D(0),   D(20),  D(0)),
            LeftArm:      e(D(0),   D(10),  D(-30)),
            LeftForeArm:  e(D(40),  D(0),   D(0)),
            LeftHand:     e(D(0),   D(-20), D(0)),
        }},
        { t: 0.3, bones: {                        // prep — pull back
            RightArm:     e(D(-5),  D(-5),  D(20)),
            RightForeArm: e(D(50),  D(0),   D(0)),
            RightHand:    e(D(0),   D(10),  D(0)),
            LeftArm:      e(D(-5),  D(5),   D(-20)),
            LeftForeArm:  e(D(50),  D(0),   D(0)),
            LeftHand:     e(D(0),   D(-10), D(0)),
        }},
        { t: 0.6, bones: {                        // stroke — thrust forward
            RightArm:     e(D(10),  D(-15), D(50)),
            RightForeArm: e(D(20),  D(0),   D(0)),
            RightHand:    e(D(0),   D(30),  D(0)),
            LeftArm:      e(D(10),  D(15),  D(-50)),
            LeftForeArm:  e(D(20),  D(0),   D(0)),
            LeftHand:     e(D(0),   D(-30), D(0)),
        }},
        { t: 0.8, bones: {                        // hold
            RightArm:     e(D(12),  D(-15), D(52)),
            RightForeArm: e(D(18),  D(0),   D(0)),
            RightHand:    e(D(0),   D(32),  D(0)),
            LeftArm:      e(D(12),  D(15),  D(-52)),
            LeftForeArm:  e(D(18),  D(0),   D(0)),
            LeftHand:     e(D(0),   D(-32), D(0)),
        }},
        { t: 1.1, bones: { ...NEUTRAL }},
    ],

    // ── STOP ───────────────────────────────────────────────────────────
    // Left palm up, right hand chops down onto it
    STOP: [
        { t: 0.0, bones: {
            LeftArm:      e(D(0),   D(5),   D(-25)),
            LeftForeArm:  e(D(30),  D(-20), D(0)),
            LeftHand:     e(D(20),  D(0),   D(0)),
            RightArm:     e(D(-20), D(-5),  D(30)),
            RightForeArm: e(D(60),  D(0),   D(0)),
            RightHand:    e(D(-10), D(90),  D(0)),
        }},
        { t: 0.3, bones: {                        // right hand rises
            LeftArm:      e(D(5),   D(5),   D(-30)),
            LeftForeArm:  e(D(25),  D(-20), D(0)),
            LeftHand:     e(D(20),  D(0),   D(0)),
            RightArm:     e(D(-35), D(-10), D(25)),
            RightForeArm: e(D(80),  D(0),   D(0)),
            RightHand:    e(D(-10), D(90),  D(0)),
        }},
        { t: 0.55, bones: {                       // chop down stroke
            LeftArm:      e(D(5),   D(5),   D(-30)),
            LeftForeArm:  e(D(25),  D(-20), D(0)),
            LeftHand:     e(D(20),  D(0),   D(0)),
            RightArm:     e(D(-10), D(-5),  D(28)),
            RightForeArm: e(D(50),  D(0),   D(0)),
            RightHand:    e(D(-10), D(90),  D(0)),
        }},
        { t: 0.75, bones: {                       // hold at contact
            LeftArm:      e(D(5),   D(5),   D(-30)),
            LeftForeArm:  e(D(25),  D(-20), D(0)),
            LeftHand:     e(D(20),  D(0),   D(0)),
            RightArm:     e(D(-8),  D(-5),  D(28)),
            RightForeArm: e(D(48),  D(0),   D(0)),
            RightHand:    e(D(-10), D(90),  D(0)),
        }},
        { t: 1.0, bones: { ...NEUTRAL }},
    ],

    // ── HELP ───────────────────────────────────────────────────────────
    // A-hand on flat palm, both rise upward (lift motion)
    HELP: [
        { t: 0.0, bones: {
            LeftArm:      e(D(0),   D(5),   D(-20)),
            LeftForeArm:  e(D(35),  D(-15), D(0)),
            LeftHand:     e(D(20),  D(0),   D(0)),
            RightArm:     e(D(-15), D(-5),  D(12)),
            RightForeArm: e(D(60),  D(0),   D(0)),
            RightHand:    e(D(0),   D(-15), D(0)),
        }},
        { t: 0.3, bones: {                        // right fist rests on left palm
            LeftArm:      e(D(5),   D(5),   D(-25)),
            LeftForeArm:  e(D(30),  D(-15), D(0)),
            LeftHand:     e(D(22),  D(0),   D(0)),
            RightArm:     e(D(-10), D(-5),  D(15)),
            RightForeArm: e(D(55),  D(0),   D(0)),
            RightHand:    e(D(0),   D(-10), D(0)),
        }},
        { t: 0.6, bones: {                        // stroke — both arms rise
            LeftArm:      e(D(-15), D(8),   D(-22)),
            LeftForeArm:  e(D(22),  D(-15), D(0)),
            LeftHand:     e(D(22),  D(0),   D(0)),
            RightArm:     e(D(-30), D(-8),  D(14)),
            RightForeArm: e(D(45),  D(0),   D(0)),
            RightHand:    e(D(0),   D(-10), D(0)),
        }},
        { t: 0.8, bones: {                        // hold
            LeftArm:      e(D(-18), D(8),   D(-22)),
            LeftForeArm:  e(D(20),  D(-15), D(0)),
            LeftHand:     e(D(22),  D(0),   D(0)),
            RightArm:     e(D(-33), D(-8),  D(14)),
            RightForeArm: e(D(42),  D(0),   D(0)),
            RightHand:    e(D(0),   D(-10), D(0)),
        }},
        { t: 1.05, bones: { ...NEUTRAL }},
    ],

    // ── LEARN ──────────────────────────────────────────────────────────
    // Fingertips scoop from palm to forehead
    LEARN: [
        { t: 0.0, bones: {
            LeftArm:      e(D(0),   D(5),   D(-20)),
            LeftForeArm:  e(D(35),  D(-15), D(0)),
            LeftHand:     e(D(20),  D(0),   D(0)),
            RightArm:     e(D(-5),  D(-5),  D(18)),
            RightForeArm: e(D(50),  D(0),   D(0)),
            RightHand:    e(D(10),  D(0),   D(20)),
        }},
        { t: 0.3, bones: {                        // scoop from left palm
            LeftArm:      e(D(5),   D(5),   D(-25)),
            LeftForeArm:  e(D(30),  D(-15), D(0)),
            LeftHand:     e(D(20),  D(0),   D(0)),
            RightArm:     e(D(-5),  D(-5),  D(18)),
            RightForeArm: e(D(55),  D(0),   D(0)),
            RightHand:    e(D(5),   D(0),   D(15)),
        }},
        { t: 0.6, bones: {                        // arc to forehead
            RightArm:     e(D(-40), D(-12), D(10)),
            RightForeArm: e(D(75),  D(0),   D(0)),
            RightHand:    e(D(-5),  D(0),   D(10)),
        }},
        { t: 0.8, bones: {                        // touch forehead, open
            RightArm:     e(D(-45), D(-15), D(8)),
            RightForeArm: e(D(78),  D(0),   D(0)),
            RightHand:    e(D(-8),  D(0),   D(5)),
        }},
        { t: 1.05, bones: { ...NEUTRAL }},
    ],

    // ── NAME ───────────────────────────────────────────────────────────
    // H-hands tap crossed index fingers twice
    NAME: [
        { t: 0.0, bones: {
            RightArm:     e(D(-10), D(-5),  D(22)),
            RightForeArm: e(D(65),  D(-15), D(0)),
            RightHand:    e(D(0),   D(20),  D(0)),
            LeftArm:      e(D(-10), D(5),   D(-22)),
            LeftForeArm:  e(D(65),  D(15),  D(0)),
            LeftHand:     e(D(0),   D(-20), D(0)),
        }},
        { t: 0.25, bones: {                       // tap 1
            RightArm:     e(D(-12), D(-5),  D(20)),
            RightForeArm: e(D(67),  D(-15), D(0)),
            LeftArm:      e(D(-12), D(5),   D(-20)),
            LeftForeArm:  e(D(67),  D(15),  D(0)),
        }},
        { t: 0.45, bones: {                       // lift
            RightArm:     e(D(-8),  D(-5),  D(24)),
            RightForeArm: e(D(63),  D(-15), D(0)),
            LeftArm:      e(D(-8),  D(5),   D(-24)),
            LeftForeArm:  e(D(63),  D(15),  D(0)),
        }},
        { t: 0.65, bones: {                       // tap 2
            RightArm:     e(D(-12), D(-5),  D(20)),
            RightForeArm: e(D(67),  D(-15), D(0)),
            LeftArm:      e(D(-12), D(5),   D(-20)),
            LeftForeArm:  e(D(67),  D(15),  D(0)),
        }},
        { t: 0.9, bones: { ...NEUTRAL }},
    ],

    // ── HOW ARE YOU ────────────────────────────────────────────────────
    // Bent hands roll over each other, then point outward
    HOW_ARE_YOU: [
        { t: 0.0, bones: {
            RightArm:     e(D(-5),  D(-10), D(30)),
            RightForeArm: e(D(50),  D(0),   D(0)),
            RightHand:    e(D(10),  D(0),   D(20)),
            LeftArm:      e(D(-5),  D(10),  D(-30)),
            LeftForeArm:  e(D(50),  D(0),   D(0)),
            LeftHand:     e(D(10),  D(0),   D(-20)),
        }},
        { t: 0.3, bones: {
            RightArm:     e(D(-5),  D(-10), D(30)),
            RightForeArm: e(D(50),  D(-30), D(0)),
            RightHand:    e(D(10),  D(0),   D(20)),
            LeftArm:      e(D(-5),  D(10),  D(-30)),
            LeftForeArm:  e(D(50),  D(30),  D(0)),
            LeftHand:     e(D(10),  D(0),   D(-20)),
        }},
        { t: 0.55, bones: {                       // roll complete, point
            RightArm:     e(D(0),   D(-10), D(40)),
            RightForeArm: e(D(30),  D(0),   D(0)),
            RightHand:    e(D(0),   D(25),  D(0)),
            LeftArm:      e(D(0),   D(10),  D(-40)),
            LeftForeArm:  e(D(30),  D(0),   D(0)),
            LeftHand:     e(D(0),   D(-25), D(0)),
        }},
        { t: 0.75, bones: {                       // hold point
            RightArm:     e(D(2),   D(-10), D(42)),
            RightForeArm: e(D(28),  D(0),   D(0)),
            RightHand:    e(D(0),   D(27),  D(0)),
            LeftArm:      e(D(2),   D(10),  D(-42)),
            LeftForeArm:  e(D(28),  D(0),   D(0)),
            LeftHand:     e(D(0),   D(-27), D(0)),
        }},
        { t: 1.1, bones: { ...NEUTRAL }},
    ],

    // ── I LOVE YOU ─────────────────────────────────────────────────────
    // ILY handshape extended toward viewer
    I_LOVE_YOU: [
        { t: 0.0, bones: {
            RightArm:     e(D(-10), D(-5),  D(20)),
            RightForeArm: e(D(60),  D(0),   D(0)),
            RightHand:    e(D(0),   D(0),   D(0)),
        }},
        { t: 0.25, bones: {                       // raise to chest height
            RightArm:     e(D(-20), D(-8),  D(15)),
            RightForeArm: e(D(70),  D(0),   D(0)),
            RightHand:    e(D(0),   D(10),  D(0)),
        }},
        { t: 0.5, bones: {                        // extend toward viewer
            RightArm:     e(D(-10), D(-8),  D(30)),
            RightForeArm: e(D(50),  D(0),   D(0)),
            RightHand:    e(D(0),   D(20),  D(0)),
        }},
        { t: 0.75, bones: {                       // hold ILY
            RightArm:     e(D(-8),  D(-8),  D(32)),
            RightForeArm: e(D(48),  D(0),   D(0)),
            RightHand:    e(D(0),   D(22),  D(0)),
        }},
        { t: 1.1, bones: { ...NEUTRAL }},
    ],

    // ── UNDERSTAND ─────────────────────────────────────────────────────
    // X-hand at forehead flicks up (light-bulb moment)
    UNDERSTAND: [
        { t: 0.0, bones: {
            RightArm:     e(D(-30), D(-10), D(12)),
            RightForeArm: e(D(82),  D(0),   D(0)),
            RightHand:    e(D(0),   D(-10), D(0)),
        }},
        { t: 0.25, bones: {
            RightArm:     e(D(-40), D(-12), D(10)),
            RightForeArm: e(D(85),  D(0),   D(0)),
            RightHand:    e(D(-5),  D(-15), D(0)),
        }},
        { t: 0.45, bones: {                       // flick up
            RightArm:     e(D(-45), D(-12), D(10)),
            RightForeArm: e(D(82),  D(0),   D(0)),
            RightHand:    e(D(-20), D(-10), D(0)),
        }},
        { t: 0.6, bones: {                        // hold extended
            RightArm:     e(D(-42), D(-12), D(10)),
            RightForeArm: e(D(80),  D(0),   D(0)),
            RightHand:    e(D(-18), D(-10), D(0)),
        }},
        { t: 0.85, bones: { ...NEUTRAL }},
    ],

    // ── FINISHED / DONE ────────────────────────────────────────────────
    // Open 5-hands flip outward from neutral
    FINISHED: [
        { t: 0.0, bones: {
            RightArm:     e(D(-5),  D(-8),  D(20)),
            RightForeArm: e(D(55),  D(0),   D(0)),
            RightHand:    e(D(0),   D(-15), D(30)),
            LeftArm:      e(D(-5),  D(8),   D(-20)),
            LeftForeArm:  e(D(55),  D(0),   D(0)),
            LeftHand:     e(D(0),   D(15),  D(-30)),
        }},
        { t: 0.3, bones: {                        // flip outward
            RightArm:     e(D(0),   D(-5),  D(35)),
            RightForeArm: e(D(45),  D(-20), D(0)),
            RightHand:    e(D(0),   D(25),  D(20)),
            LeftArm:      e(D(0),   D(5),   D(-35)),
            LeftForeArm:  e(D(45),  D(20),  D(0)),
            LeftHand:     e(D(0),   D(-25), D(-20)),
        }},
        { t: 0.55, bones: {                       // hold
            RightArm:     e(D(2),   D(-5),  D(38)),
            RightForeArm: e(D(43),  D(-22), D(0)),
            RightHand:    e(D(0),   D(27),  D(20)),
            LeftArm:      e(D(2),   D(5),   D(-38)),
            LeftForeArm:  e(D(43),  D(22),  D(0)),
            LeftHand:     e(D(0),   D(-27), D(-20)),
        }},
        { t: 0.8, bones: { ...NEUTRAL }},
    ],

    // ── WATER ──────────────────────────────────────────────────────────
    // W-hand taps chin twice
    WATER: [
        { t: 0.0, bones: {
            RightArm:     e(D(-18), D(-8),  D(10)),
            RightForeArm: e(D(68),  D(0),   D(0)),
            RightHand:    e(D(-15), D(15),  D(0)),
        }},
        { t: 0.22, bones: {
            RightArm:     e(D(-22), D(-10), D(8)),
            RightForeArm: e(D(74),  D(0),   D(0)),
            RightHand:    e(D(-20), D(15),  D(0)),
        }},
        { t: 0.42, bones: {
            RightArm:     e(D(-16), D(-8),  D(12)),
            RightForeArm: e(D(66),  D(0),   D(0)),
            RightHand:    e(D(-12), D(15),  D(0)),
        }},
        { t: 0.58, bones: {
            RightArm:     e(D(-22), D(-10), D(8)),
            RightForeArm: e(D(74),  D(0),   D(0)),
            RightHand:    e(D(-20), D(15),  D(0)),
        }},
        { t: 0.78, bones: { ...NEUTRAL }},
    ],

};

// ─── Word aliases ──────────────────────────────────────────────────────
// Maps spoken/transcribed variants → canonical WORD_SIGNS key.
// All keys must be uppercase.
export const WORD_ALIASES = {
    'HI':           'HELLO',
    'HEY':          'HELLO',
    'GREETINGS':    'HELLO',
    'THANKS':       'THANK_YOU',
    'THANKYOU':     'THANK_YOU',
    'THANK':        'THANK_YOU',
    'WELCOME':      'WELCOME',
    'PLEASE':       'PLEASE',
    'SORRY':        'SORRY',
    'APOLOGIZE':    'SORRY',
    'APOLOGIES':    'SORRY',
    'EXCUSE':       'SORRY',
    'YES':          'YES',
    'YEAH':         'YES',
    'YEP':          'YES',
    'NO':           'NO',
    'NOPE':         'NO',
    'NAH':          'NO',
    'GOOD':         'GOOD',
    'GREAT':        'GOOD',
    'NICE':         'GOOD',
    'BAD':          'BAD',
    'WRONG':        'BAD',
    'GO':           'GO',
    'MOVE':         'GO',
    'LEAVE':        'GO',
    'STOP':         'STOP',
    'HALT':         'STOP',
    'WAIT':         'STOP',
    'HELP':         'HELP',
    'ASSIST':       'HELP',
    'SUPPORT':      'HELP',
    'LEARN':        'LEARN',
    'STUDY':        'LEARN',
    'EDUCATION':    'LEARN',
    'NAME':         'NAME',
    'CALLED':       'NAME',
    'HOW':          'HOW_ARE_YOU',
    'HOW ARE YOU':  'HOW_ARE_YOU',
    'HOW ARE':      'HOW_ARE_YOU',
    'I LOVE YOU':   'I_LOVE_YOU',
    'LOVE':         'I_LOVE_YOU',
    'ILY':          'I_LOVE_YOU',
    'UNDERSTAND':   'UNDERSTAND',
    'GET IT':       'UNDERSTAND',
    'KNOW':         'UNDERSTAND',
    'DONE':         'FINISHED',
    'FINISH':       'FINISHED',
    'FINISHED':     'FINISHED',
    'COMPLETE':     'FINISHED',
    'WATER':        'WATER',
    'DRINK':        'WATER',
};

// ─── Lookup function ───────────────────────────────────────────────────
/**
 * Given a word/phrase string, return the canonical sign key or null.
 * Tries exact match first, then alias map.
 * @param {string} word
 * @returns {string|null}
 */
export function resolveSign(word) {
    const upper = word.toUpperCase().trim();
    if (WORD_SIGNS[upper])       return upper;
    if (WORD_ALIASES[upper])     return WORD_ALIASES[upper];
    return null;
}

/**
 * Tokenize a sentence into words/phrases, resolving each to a sign key.
 * Multi-word phrases (e.g. "HOW ARE YOU", "I LOVE YOU") are tried first.
 * @param {string} sentence
 * @returns {string[]} array of sign keys
 */
export function tokenizeToSigns(sentence) {
    const words = sentence.toUpperCase().trim().split(/\s+/);
    const signs = [];
    let i = 0;
    while (i < words.length) {
        // Try 3-word phrase first, then 2-word, then 1-word
        let matched = false;
        for (let len = 3; len >= 1; len--) {
            if (i + len > words.length) continue;
            const phrase = words.slice(i, i + len).join(' ');
            const key = resolveSign(phrase);
            if (key) {
                signs.push(key);
                i += len;
                matched = true;
                break;
            }
        }
        if (!matched) i++; // skip unknown word
    }
    return signs;
}
