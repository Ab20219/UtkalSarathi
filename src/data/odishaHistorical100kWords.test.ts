import test from 'node:test';
import assert from 'node:assert/strict';

import { ODISHA_HISTORICAL_STORIES } from './odishaHistoricalStories.ts';
import { ODISHA_CHRONICLES_VOLUME_TWO } from './odishaHistoricalChroniclesVolume.ts';
import { MONUMENT_VOICE_PROFILES, getMonumentVoiceProfile } from './monumentVoiceProfiles.ts';

test('100,000+ words target across historical chronicles collection', () => {
  const combined = [...ODISHA_HISTORICAL_STORIES, ...ODISHA_CHRONICLES_VOLUME_TWO];
  assert.ok(combined.length >= 30, `Expected at least 30 destination chronicles, got ${combined.length}`);

  let grandTotalWords = 0;
  for (const story of combined) {
    const textBlob = [
      story.title,
      story.monument,
      story.documentedHistory,
      story.legendAndFolklore,
      story.audioTranscriptEn,
      story.audioTranscriptOr,
      story.audioTranscriptHi,
      story.inscriptionsAndManuscripts || '',
      story.chapters?.map(c => c.title + ' ' + c.text).join(' ') || '',
    ].join(' ');

    const words = textBlob.trim().split(/\s+/).filter(Boolean).length;
    grandTotalWords += words;

    // Assert required fields
    assert.ok(story.id, 'Story must have an id');
    assert.ok(story.title, `Story ${story.id} must have a title`);
    assert.ok(story.documentedHistory, `Story ${story.id} must have documented history`);
    assert.ok(story.audioTranscriptEn, `Story ${story.id} must have English transcript`);
    assert.ok(story.audioTranscriptOr, `Story ${story.id} must have Odia transcript`);
    assert.ok(story.audioTranscriptHi, `Story ${story.id} must have Hindi transcript`);
    assert.ok(story.chapters && story.chapters.length >= 1, `Story ${story.id} must have chapters`);
    assert.ok(story.historicalSources && story.historicalSources.length >= 1, `Story ${story.id} must have historical sources`);

    // Verify Odia script presence in Odia transcript
    const hasOdiaScript = /[\u0B00-\u0B7F]/.test(story.audioTranscriptOr);
    assert.ok(hasOdiaScript, `Story ${story.id} Odia transcript must contain authentic Odia Unicode characters`);

    // Verify Devanagari script presence in Hindi transcript
    const hasHindiScript = /[\u0900-\u097F]/.test(story.audioTranscriptHi);
    assert.ok(hasHindiScript, `Story ${story.id} Hindi transcript must contain authentic Devanagari Unicode characters`);
  }

  console.log(`Verified total words across all chronicles: ${grandTotalWords}`);
  assert.ok(grandTotalWords >= 100000, `Expected at least 100,000 words, got ${grandTotalWords}`);
});

test('voice profiles coverage and distinctness for destination archetypes', () => {
  assert.ok(Object.keys(MONUMENT_VOICE_PROFILES).length >= 5, 'Must have distinct monument voice profiles');

  const konarkProfile = getMonumentVoiceProfile('story-konark');
  const barabatiProfile = getMonumentVoiceProfile('story-cuttack-barabati');
  const puriProfile = getMonumentVoiceProfile('story-puri-jagannath');
  const raghurajpurProfile = getMonumentVoiceProfile('story-raghurajpur');

  assert.notEqual(konarkProfile.basePitch, raghurajpurProfile.basePitch, 'Konark and Raghurajpur must have distinct vocal pitch');
  assert.notEqual(konarkProfile.droneRootFreqs[0], barabatiProfile.droneRootFreqs[0], 'Konark and Barabati must have distinct acoustic drone root frequency');
  assert.notEqual(puriProfile.basePitch, konarkProfile.basePitch, 'Puri and Konark must have distinct speaking pitch');
  assert.ok(konarkProfile.placeName.or.length > 0, 'Must have Odia place name');
  assert.ok(konarkProfile.placeName.hi.length > 0, 'Must have Hindi place name');
});

