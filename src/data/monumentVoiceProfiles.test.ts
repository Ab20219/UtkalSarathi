import test from 'node:test';
import assert from 'node:assert';
import { MONUMENT_VOICE_PROFILES, getMonumentVoiceProfile } from './monumentVoiceProfiles.ts';
import { AUDIO_GUIDE_STORIES } from './mockData.ts';

test('verifies all 13 historic monuments have unique voice profiles', () => {
  const storyIds = AUDIO_GUIDE_STORIES.map((s) => s.id);
  assert.strictEqual(storyIds.length, 13);

  const pitches = new Set<number>();
  const narratorNames = new Set<string>();

  for (const storyId of storyIds) {
    const profile = MONUMENT_VOICE_PROFILES[storyId];
    assert.ok(profile, `Voice profile must exist for monument story id: ${storyId}`);

    // Multilingual names and titles must be present
    assert.ok(profile.placeName.en && profile.placeName.or && profile.placeName.hi);
    assert.ok(profile.narratorName.en && profile.narratorName.or && profile.narratorName.hi);
    assert.ok(profile.voicePersonaTitle.en && profile.voicePersonaTitle.or && profile.voicePersonaTitle.hi);

    // Timbre description must be defined
    assert.ok(profile.timbreDescription && profile.timbreDescription.length > 10);

    // Drone frequencies must contain 4 harmonic frequencies
    assert.strictEqual(profile.droneRootFreqs.length, 4);
    assert.ok(profile.droneRootFreqs[0] > 40 && profile.droneRootFreqs[0] < 200);

    // Multilingual cultural greetings
    assert.ok(profile.culturalGreeting.or.length > 5);
    assert.ok(profile.culturalGreeting.hi.length > 5);
    assert.ok(profile.culturalGreeting.en.length > 5);

    // At least 3 curated questions in Odia, Hindi, and English
    assert.ok(profile.curatedQuestions.length >= 3);
    for (const q of profile.curatedQuestions) {
      assert.ok(q.or.length > 5);
      assert.ok(q.hi.length > 5);
      assert.ok(q.en.length > 5);
    }

    pitches.add(profile.basePitch);
    narratorNames.add(profile.narratorName.en);
  }

  // Voice differentiation: there must be multiple distinct narrator voices & pitches
  assert.ok(narratorNames.size >= 12, 'Every monument should have a distinct narrator identity');
  assert.ok(pitches.size >= 10, 'Every monument should have distinct pitch calibration');
});

test('getMonumentVoiceProfile returns profile for valid and fallback queries', () => {
  const konark = getMonumentVoiceProfile('story-konark');
  assert.strictEqual(konark.id, 'story-konark');
  assert.strictEqual(konark.placeName.en, 'Konark Sun Temple');

  const puri = getMonumentVoiceProfile('story-puri-jagannath');
  assert.strictEqual(puri.id, 'story-puri-jagannath');
  assert.ok(puri.narratorName.en.includes('Daitapati'));

  // Fallback to Konark for unknown id
  const fallback = getMonumentVoiceProfile('unknown-random-id');
  assert.strictEqual(fallback.id, 'story-konark');
});
