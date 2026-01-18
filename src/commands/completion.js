/**
 * 2ndBrain CLI - Completion Command
 * 
 * Generate shell completion scripts (kubectl style)
 */

const BASH_COMPLETION = `# 2ndbrain bash completion
#
# Installation:
#
#   ## Load completion into current shell
#   source <(2ndbrain completion bash)
#
#   ## Or write to file and source from .bash_profile (recommended for macOS)
#   2ndbrain completion bash > ~/.2ndbrain-completion.bash
#   echo 'source ~/.2ndbrain-completion.bash' >> ~/.bash_profile
#   source ~/.bash_profile
#
# Note: On macOS with bash 3.x, "source <(...)" may not work.
# Use the file-based method instead, or install bash 4+ via Homebrew.

_2ndbrain_completions() {
  local cur="\${COMP_WORDS[COMP_CWORD]}"
  local prev="\${COMP_WORDS[COMP_CWORD-1]}"
  local cmd="\${COMP_WORDS[1]}"

  # Top-level commands
  local commands="init update remove member completion"

  case "\$cmd" in
    init)
      case "\$prev" in
        -t|--template)
          COMPREPLY=( $(compgen -d -- "\$cur") )
          return 0
          ;;
      esac
      COMPREPLY=( $(compgen -W "-t --template -f --force -h --help" -- "\$cur") )
      [[ -z "\$cur" || "\$cur" != -* ]] && COMPREPLY+=( $(compgen -d -- "\$cur") )
      ;;
    update)
      case "\$prev" in
        -t|--template)
          COMPREPLY=( $(compgen -d -- "\$cur") )
          return 0
          ;;
      esac
      COMPREPLY=( $(compgen -W "-t --template -d --dry-run -h --help" -- "\$cur") )
      [[ -z "\$cur" || "\$cur" != -* ]] && COMPREPLY+=( $(compgen -d -- "\$cur") )
      ;;
    remove)
      COMPREPLY=( $(compgen -W "-d --dry-run -f --force -h --help" -- "\$cur") )
      [[ -z "\$cur" || "\$cur" != -* ]] && COMPREPLY+=( $(compgen -d -- "\$cur") )
      ;;
    member)
      COMPREPLY=( $(compgen -W "-f --force --no-config -h --help" -- "\$cur") )
      ;;
    completion)
      COMPREPLY=( $(compgen -W "bash zsh fish" -- "\$cur") )
      ;;
    *)
      COMPREPLY=( $(compgen -W "\$commands -V --version -h --help" -- "\$cur") )
      ;;
  esac
}

complete -F _2ndbrain_completions 2ndbrain
`;

const ZSH_COMPLETION = `#compdef 2ndbrain

# 2ndbrain zsh completion

_2ndbrain() {
  local -a commands
  commands=(
    'init:Initialize a new 2ndBrain project'
    'update:Update framework files from template'
    'remove:Remove framework files (preserves user data)'
    'member:Initialize a new member directory'
    'completion:Generate shell completion script'
  )

  _arguments -C \\
    '(-V --version)'{-V,--version}'[Show version]' \\
    '(-h --help)'{-h,--help}'[Show help]' \\
    '1: :->command' \\
    '*:: :->args'

  case \$state in
    command)
      _describe -t commands 'commands' commands
      ;;
    args)
      case \$words[1] in
        init)
          _arguments \\
            '(-t --template)'{-t,--template}'[Use custom template directory]:directory:_directories' \\
            '(-f --force)'{-f,--force}'[Force overwrite existing project]' \\
            '(-h --help)'{-h,--help}'[Show help]' \\
            '1:path:_directories'
          ;;
        update)
          _arguments \\
            '(-t --template)'{-t,--template}'[Use custom template directory]:directory:_directories' \\
            '(-d --dry-run)'{-d,--dry-run}'[Show what would be updated]' \\
            '(-h --help)'{-h,--help}'[Show help]' \\
            '1:path:_directories'
          ;;
        remove)
          _arguments \\
            '(-d --dry-run)'{-d,--dry-run}'[Show what would be removed]' \\
            '(-f --force)'{-f,--force}'[Force removal without confirmation]' \\
            '(-h --help)'{-h,--help}'[Show help]' \\
            '1:path:_directories'
          ;;
        member)
          _arguments \\
            '(-f --force)'{-f,--force}'[Force overwrite existing member]' \\
            '--no-config[Skip Obsidian config update]' \\
            '(-h --help)'{-h,--help}'[Show help]' \\
            '1:name:' \\
            '2:path:_directories'
          ;;
        completion)
          _arguments \\
            '1:shell:(bash zsh fish)'
          ;;
      esac
      ;;
  esac
}

_2ndbrain
`;

const FISH_COMPLETION = `# 2ndbrain fish completion

# Disable file completion by default
complete -c 2ndbrain -f

# Top-level commands
complete -c 2ndbrain -n '__fish_use_subcommand' -a 'init' -d 'Initialize a new 2ndBrain project'
complete -c 2ndbrain -n '__fish_use_subcommand' -a 'update' -d 'Update framework files from template'
complete -c 2ndbrain -n '__fish_use_subcommand' -a 'remove' -d 'Remove framework files'
complete -c 2ndbrain -n '__fish_use_subcommand' -a 'member' -d 'Initialize a new member directory'
complete -c 2ndbrain -n '__fish_use_subcommand' -a 'completion' -d 'Generate shell completion script'

# Global options
complete -c 2ndbrain -n '__fish_use_subcommand' -s V -l version -d 'Show version'
complete -c 2ndbrain -n '__fish_use_subcommand' -s h -l help -d 'Show help'

# init options
complete -c 2ndbrain -n '__fish_seen_subcommand_from init' -s t -l template -d 'Use custom template directory' -r -a '(__fish_complete_directories)'
complete -c 2ndbrain -n '__fish_seen_subcommand_from init' -s f -l force -d 'Force overwrite existing project'
complete -c 2ndbrain -n '__fish_seen_subcommand_from init' -s h -l help -d 'Show help'
complete -c 2ndbrain -n '__fish_seen_subcommand_from init' -a '(__fish_complete_directories)'

# update options
complete -c 2ndbrain -n '__fish_seen_subcommand_from update' -s t -l template -d 'Use custom template directory' -r -a '(__fish_complete_directories)'
complete -c 2ndbrain -n '__fish_seen_subcommand_from update' -s d -l dry-run -d 'Show what would be updated'
complete -c 2ndbrain -n '__fish_seen_subcommand_from update' -s h -l help -d 'Show help'
complete -c 2ndbrain -n '__fish_seen_subcommand_from update' -a '(__fish_complete_directories)'

# remove options
complete -c 2ndbrain -n '__fish_seen_subcommand_from remove' -s d -l dry-run -d 'Show what would be removed'
complete -c 2ndbrain -n '__fish_seen_subcommand_from remove' -s f -l force -d 'Force removal without confirmation'
complete -c 2ndbrain -n '__fish_seen_subcommand_from remove' -s h -l help -d 'Show help'
complete -c 2ndbrain -n '__fish_seen_subcommand_from remove' -a '(__fish_complete_directories)'

# member options
complete -c 2ndbrain -n '__fish_seen_subcommand_from member' -s f -l force -d 'Force overwrite existing member'
complete -c 2ndbrain -n '__fish_seen_subcommand_from member' -l no-config -d 'Skip Obsidian config update'
complete -c 2ndbrain -n '__fish_seen_subcommand_from member' -s h -l help -d 'Show help'

# completion options
complete -c 2ndbrain -n '__fish_seen_subcommand_from completion' -a 'bash zsh fish'
`;

/**
 * Generate shell completion script
 * @param {string} shell - Shell type: bash, zsh, or fish
 * @returns {string|null} Completion script or null if unsupported
 */
function completion(shell) {
  switch (shell) {
    case 'bash':
      return BASH_COMPLETION;
    case 'zsh':
      return ZSH_COMPLETION;
    case 'fish':
      return FISH_COMPLETION;
    default:
      return null;
  }
}

module.exports = completion;
