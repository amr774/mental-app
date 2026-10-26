Set oShell = CreateObject("WScript.Shell")

Dim base
base = "C:\Users\amr67\OneDrive\Pictures\graduation"

' Start Backend
oShell.Run "cmd /k cd /d " & base & "\backend && npm run dev", 1, False

WScript.Sleep 3000

' Start Web Frontend
oShell.Run "cmd /k cd /d " & base & "\mental-app && npm run dev", 1, False

WScript.Sleep 2000

' Start Mobile App
oShell.Run "cmd /k cd /d " & base & "\mobile && set BROWSER=NONE && npx expo start --web", 1, False

WScript.Sleep 12000

' Open Chrome browsers
oShell.Run "cmd /c start chrome http://localhost:5173", 0, False

MsgBox "Mindful App started!" & vbCrLf & vbCrLf & _
       "Backend:      http://localhost:3000" & vbCrLf & _
       "Web Frontend: http://localhost:5173" & vbCrLf & _
       "Mobile App:   http://localhost:8081" & vbCrLf & vbCrLf & _
       "Mobile view tip: press F12 then Ctrl+Shift+M in Chrome", _
       vbInformation, "Mindful - All Systems Go"
