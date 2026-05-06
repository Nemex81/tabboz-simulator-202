"""Script di sostituzione dei contenuti tab in App.tsx."""
import pathlib

FILE = pathlib.Path('src/App.tsx')
content = FILE.read_text(encoding='utf-8')

# ── 1. STATUS TAB ────────────────────────────────────────────────────────────
STATUS_START = '          <TabsContent value="status" className="space-y-6 mt-6">'
STATUS_END   = '          </TabsContent>\n\n          <TabsContent value="school" className="space-y-6 mt-6">'
STATUS_NEW   = '''          <TabsContent value="status" className="space-y-6 mt-6">
            <StatusTab
              currentTheme={(currentTheme ?? 'default') as ThemeVariant}
              onThemeChange={handleThemeChange}
              schoolYear={gameTime.schoolYear.currentYear}
              playerProfile={playerProfile ?? null}
              schoolType={schoolType}
              age={gameTime.age}
              onResetRequest={() => setShowResetDialog(true)}
            />
          </TabsContent>

          <TabsContent value="school" className="space-y-6 mt-6">'''

# ── 2. SCHOOL TAB ────────────────────────────────────────────────────────────
SCHOOL_START = '          <TabsContent value="school" className="space-y-6 mt-6">'
SCHOOL_END   = '          </TabsContent>\n\n          <TabsContent value="character">'
SCHOOL_NEW   = '''          <TabsContent value="school" className="space-y-6 mt-6">
            <SchoolTab
              schoolType={schoolType}
              schoolYear={gameTime.schoolYear.currentYear}
              grades={grades}
              currentMedia={currentMedia}
              rawGradesHistory={rawGradesHistory ?? {}}
              scheduledExams={scheduledExams}
              stats={stats}
              friends={friends}
              teachers={teachers ?? []}
              classRoster={classRoster ?? []}
              schoolRecord={schoolRecord}
              girlfriend={girlfriend ?? null}
              phaseActionsLeft={phaseActionsLeft}
              phaseActionsRemaining={phaseActionsRemaining ?? 0}
              dayType={dayType}
              currentPhase={currentPhase}
              currentDate={gameTime.currentDate}
              isSchoolPeriod={gameTime.schoolYear.isSchoolPeriod}
              schoolSubPanel={schoolSubPanel}
              setSchoolSubPanel={setSchoolSubPanel}
              schoolDayState={_schoolDayStateFromHook}
              timetable={timetable ?? null}
              showSchoolMorning={showSchoolMorning}
              schoolMorningEvents={schoolMorningEvents}
              showStreetMorning={showStreetMorning}
              streetMorningEvents={streetMorningEvents}
              morningChoicePending={morningChoicePending}
              marinatoOggi={marinatoOggi}
              afternoonEvent={afternoonEvent}
              handleVaiAScuola={handleVaiAScuola}
              handleMarina={handleMarina}
              handleOpenCorrompiDialog={handleOpenCorrompiDialog}
              handleOpenMinacciaDialog={handleOpenMinacciaDialog}
              handleFriendAction={handleFriendAction}
              handleGirlfriendAction={handleGirlfriendAction}
              handleGirlfriendBreakup={handleGirlfriendBreakup}
              handlePrepareExam={handlePrepareExam}
              handleAfternoonChoice={handleAfternoonChoice}
              handlePromoteToFriend={handlePromoteToFriend}
              doInteraction={doInteraction}
              onTeacherInteraction={onTeacherInteraction}
              onStatChange={setStats}
              onTeacherChange={onTeacherChange}
              onClassmateChange={onClassmateChange}
              onNewFriend={onNewFriend}
              onSlotComplete={onSlotComplete}
              onBreakComplete={onBreakComplete}
              gainExtraAction={gainExtraAction}
              consumeAction={consumeAction}
              announce={announce}
              addLogEntry={addLogEntry}
            />
          </TabsContent>

          <TabsContent value="character">'''

# ── 3. SOCIAL TAB ────────────────────────────────────────────────────────────
SOCIAL_START = '          <TabsContent value="social" className="space-y-6 mt-6">'
SOCIAL_END   = '          </TabsContent>\n\n          <TabsContent value="city" className="space-y-6 mt-6">'
SOCIAL_NEW   = '''          <TabsContent value="social" className="space-y-6 mt-6">
            <SocialTab
              morningChoicePending={morningChoicePending}
              phaseActionsLeft={phaseActionsLeft}
              isSchoolPeriod={gameTime.schoolYear.isSchoolPeriod}
              stanchezza={stats.stanchezza}
              soldi={stats.soldi}
              intelligenza={stats.intelligenza}
              handleStudia={handleStudia}
              handleChiacchiera={handleChiacchiera}
              handleParco={handleParco}
              handleTelefona={handleTelefona}
              handleProvarciConAtipa={handleProvarciConAtipa}
              handleMotorino={handleMotorino}
              announce={announce}
            />
          </TabsContent>

          <TabsContent value="city" className="space-y-6 mt-6">'''

# ── 4. CITY TAB ──────────────────────────────────────────────────────────────
CITY_START = '          <TabsContent value="city" className="space-y-6 mt-6">'
CITY_END   = '          </TabsContent>\n        </Tabs>'
CITY_NEW   = '''          <TabsContent value="city" className="space-y-6 mt-6">
            <CityTab
              onDisco={handleDisco}
              onCinema={handleCinema}
              onShopping={handleShoppingMall}
              onPalestra={handlePalestra}
              onLampada={handleLampada}
              onLavoro={handleLavoro}
              morningChoicePending={morningChoicePending}
              actionsRemaining={phaseActionsRemaining ?? 0}
              soldi={stats.soldi}
              muscoli={stats.muscoli}
              stanchezza={stats.stanchezza}
            />
          </TabsContent>
        </Tabs>'''


def safe_replace(text: str, start: str, end: str, replacement: str, label: str) -> str:
    start_idx = text.find(start)
    end_idx   = text.find(end)
    if start_idx == -1:
        raise ValueError(f"Start marker NOT FOUND for {label}: {start[:60]!r}")
    if end_idx == -1:
        raise ValueError(f"End marker NOT FOUND for {label}: {end[:60]!r}")
    end_full = end_idx + len(end)
    print(f"  {label}: lines {text[:start_idx].count(chr(10))+1}–{text[:end_full].count(chr(10))}")
    return text[:start_idx] + replacement + text[end_full:]


print("Applicando sostituzioni a App.tsx...")
content = safe_replace(content, STATUS_START, STATUS_END, STATUS_NEW, "StatusTab")
content = safe_replace(content, SCHOOL_START, SCHOOL_END, SCHOOL_NEW, "SchoolTab")
content = safe_replace(content, SOCIAL_START, SOCIAL_END, SOCIAL_NEW, "SocialTab")
content = safe_replace(content, CITY_START, CITY_END, CITY_NEW, "CityTab")

FILE.write_text(content, encoding='utf-8')
lines = content.count('\n') + 1
print(f"Completato. App.tsx ora ha {lines} righe.")
